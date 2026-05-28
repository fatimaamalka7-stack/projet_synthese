<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use App\Models\AdminNotification;
use App\Models\LoyaltyTransaction;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Services\AdminNotificationService;
use App\Http\Controllers\API\PaymentController;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:livraison,carte,paypal',
            'address'        => 'required|string|max:500',
            'payment_email'  => 'required_if:payment_method,carte|nullable|email|max:255',
            'verification_code' => 'required_if:payment_method,carte|nullable|digits:6',
            'points_to_redeem' => 'nullable|integer|min:0',
        ]);

        $verificationKey = null;
        if ($request->payment_method === 'carte') {
            $verificationKey = PaymentController::cardVerificationCacheKey(
                $request->user()->id,
                $request->payment_email
            );

            if (Cache::get($verificationKey) !== $request->verification_code) {
                return response()->json(['message' => 'Code de verification invalide ou expire'], 422);
            }
        }

        $cart = Cart::where('user_id', $request->user()->id)
            ->with('items.product')
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Panier vide'], 422);
        }

        DB::beginTransaction();
        try {
            $settings = LoyaltyService::getSettings();
            $user = $request->user();

            $subtotal = $cart->items->sum(fn($i) => $i->quantity * $i->product->price);
            $pointsToRedeem = (int) $request->input('points_to_redeem', 0);
            $redeemedPoints = 0;
            $redemptionAmount = 0;

            if ($pointsToRedeem > 0 && $user->total_points > 0) {
                $redeemedPoints = LoyaltyService::maxRedeemablePoints($pointsToRedeem, $subtotal);
                $redemptionAmount = LoyaltyService::calculateRedemptionAmount($redeemedPoints);

                if ($redeemedPoints > 0) {
                    $user->decrement('total_points', $redeemedPoints);
                }
            }

            $total = max(0, $subtotal - $redemptionAmount);
            $earnedPoints = LoyaltyService::calculatePointsEarned($subtotal);

            if ($earnedPoints > 0) {
                $user->increment('total_points', $earnedPoints);
            }

            $user->save();

            $order = Order::create([
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'total' => $total,
                'points_redeemed' => $redeemedPoints,
                'redemption_amount' => $redemptionAmount,
                'loyalty_points_earned' => $earnedPoints,
                'loyalty_level_at_order' => null,
                'status' => 'en_attente',
                'payment_method' => $request->payment_method,
                'address' => $request->address,
            ]);

            foreach ($cart->items as $item) {
                if ($item->product->stock < $item->quantity) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Stock insuffisant pour {$item->product->name}"
                    ], 422);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            if ($redeemedPoints > 0) {
                LoyaltyTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'usage',
                    'points' => -$redeemedPoints,
                    'description' => "Utilisation de {$redeemedPoints} points pour une réduction de {$redemptionAmount} DH",
                    'order_id' => $order->id,
                    'amount' => $redemptionAmount,
                ]);
            }

            if ($earnedPoints > 0) {
                LoyaltyTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'earn',
                    'points' => $earnedPoints,
                    'description' => 'Points gagnés pour la commande',
                    'order_id' => $order->id,
                    'amount' => 0,
                ]);
            }

            $cart->items()->delete();

            DB::commit();

            $order->load('items.product');

            if ($request->payment_method === 'carte') {
                \App\Models\Payment::create([
                    'order_id' => $order->id,
                    'amount' => $total,
                    'method' => 'carte',
                    'status' => 'complete',
                ]);
            }

            AdminNotificationService::create(
                'order_created',
                'Nouvelle commande',
                "Commande #{$order->id} passee par {$request->user()->name} pour {$order->total} DH.",
                $order,
                $request->user()
            );

            if ($verificationKey) {
                Cache::forget($verificationKey);
            }

            return response()->json([
                'message' => 'Commande passée avec succès',
                'order' => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la commande', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'returnRequests'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'returnRequests'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->with('items.product')->findOrFail($id);

        if (!$order->canBeCanceledOrReturned()) {
            return response()->json(['message' => 'La commande ne peut plus être annulée ou retournée'], 422);
        }

        DB::beginTransaction();
        try {
            $user = $request->user();

            if ($order->points_redeemed > 0) {
                $user->increment('total_points', $order->points_redeemed);
                LoyaltyTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'refund',
                    'points' => $order->points_redeemed,
                    'description' => 'Restauration des points suite à l\'annulation de la commande',
                    'order_id' => $order->id,
                    'amount' => 0,
                ]);
            }

            if ($order->loyalty_points_earned > 0) {
                $pointsToRemove = min($user->total_points, $order->loyalty_points_earned);
                if ($pointsToRemove > 0) {
                    $user->decrement('total_points', $pointsToRemove);
                    LoyaltyTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'reversal',
                        'points' => -$pointsToRemove,
                        'description' => 'Retrait des points gagnés après annulation de commande',
                        'order_id' => $order->id,
                        'amount' => 0,
                    ]);
                }
            }

            $user->save();

            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $order->update([
                'status' => $order->status === 'livree' ? 'retournee' : 'annulee',
                'returned_at' => $order->status === 'livree' ? now() : $order->returned_at,
                'stock_restored_at' => now(),
            ]);

            DB::commit();

            return response()->json(['message' => 'Commande annulée et stock restauré']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de l\'annulation de la commande', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin
    public function adminIndex(Request $request)
    {
        $query = Order::with(['user', 'items.product', 'returnRequests', 'payment']);

        if ($request->status) {
            if ($request->status === 'retournee') {
                $query->whereNotNull('returned_at');
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->boolean('unseen')) {
            $query->whereNull('admin_seen_at');
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($orders);
    }

    public function unseenCount()
    {
        return response()->json([
            'count' => Order::whereNull('admin_seen_at')->count(),
        ]);
    }

    public function markAsSeen($id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);

        if (! $order->admin_seen_at) {
            $order->update(['admin_seen_at' => now()]);
        }

        AdminNotification::where('type', 'order_created')
            ->where('notifiable_type', Order::class)
            ->where('notifiable_id', $order->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Commande marquee comme vue',
            'order' => $order->fresh(['user', 'items.product']),
            'unseen_count' => Order::whereNull('admin_seen_at')->count(),
            'unread_notifications' => AdminNotification::unread()->count(),
        ]);
    }

    public function markAllAsSeen()
    {
        $seenAt = now();

        Order::whereNull('admin_seen_at')->update(['admin_seen_at' => $seenAt]);

        AdminNotification::where('type', 'order_created')
            ->whereNull('read_at')
            ->update(['read_at' => $seenAt]);

        return response()->json([
            'message' => 'Commandes marquees comme vues',
            'seen_at' => $seenAt,
            'unseen_count' => 0,
            'unread_notifications' => AdminNotification::unread()->count(),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:en_attente,confirmee,expediee,livree,annulee,retournee',
        ]);

        $order = Order::with('items.product')->findOrFail($id);

        $data = ['status' => $request->status];
        if ($request->status === 'livree' && !$order->delivered_at) {
            $data['delivered_at'] = now();
        }

        if (in_array($request->status, ['annulee', 'retournee']) && !$order->hasRestoredStock()) {
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }
            $data['stock_restored_at'] = now();
        }

        if ($request->status === 'retournee' && !$order->returned_at) {
            $data['returned_at'] = now();
        }

        $order->update($data);

        return response()->json(['message' => 'Statut mis à jour', 'order' => $order->fresh(['user', 'items.product', 'returnRequests', 'payment'])]);
    }

    public function restock(Request $request, $id)
    {
        $order = Order::with('items.product')->findOrFail($id);

        if ($order->hasRestoredStock()) {
            return response()->json(['message' => 'Le stock a déjà été restauré pour cette commande'], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $order->update(['stock_restored_at' => now()]);
            DB::commit();

            return response()->json(['message' => 'Stock restauré pour la commande', 'order' => $order]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la restauration du stock', 'error' => $e->getMessage()], 500);
        }
    }

    public function returnOrder(Request $request, $id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);

        if ($order->returned_at || $order->status === 'retournee') {
            return response()->json(['message' => 'Cette commande a déjà été retournée'], 422);
        }

        if (!$order->canBeCanceledOrReturned()) {
            return response()->json(['message' => 'La période de retour de 24 heures est expirée'], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $order->update([
                'status' => 'retournee',
                'returned_at' => now(),
                'stock_restored_at' => now(),
            ]);

            DB::commit();

            return response()->json(['message' => 'Commande marquée comme retournée et le stock a été restauré', 'order' => $order->fresh(['user', 'items.product'])]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors du traitement du retour', 'error' => $e->getMessage()], 500);
        }
    }
}
