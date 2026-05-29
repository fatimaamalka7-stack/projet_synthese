<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use App\Models\AdminNotification;
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
            $total = $cart->items->sum(fn($i) => $i->quantity * $i->product->price);

            $order = Order::create([
                'user_id'        => $request->user()->id,
                'total'          => $total,
                'status'         => 'en_attente',
                'payment_method' => $request->payment_method,
                'address'        => $request->address,
            ]);

            foreach ($cart->items as $item) {
                if ($item->product->stock < $item->quantity) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Stock insuffisant pour {$item->product->name}"
                    ], 422);
                }

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'quantity'   => $item->quantity,
                    'price'      => $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            $cart->items()->delete();

            DB::commit();

            $order->load('items.product');

            // If payment was made by card, create a payment record (payment already succeeded client-side)
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
                "Commande #{$order->id} passee par {$request->user()->name}  {$order->total} DH.",
                $order,
                $request->user()
            );

            if ($verificationKey) {
                Cache::forget($verificationKey);
            }

            return response()->json([
                'message' => 'Commande passée avec succès',
                'order'   => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la commande', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->findOrFail($id);

        return response()->json($order);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if (!in_array($order->status, ['en_attente'])) {
            return response()->json(['message' => 'Impossible d\'annuler cette commande'], 422);
        }

        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        $order->update(['status' => 'annulee']);

        return response()->json(['message' => 'Commande annulée']);
    }

    // Admin
    public function adminIndex(Request $request)
    {
        $query = Order::with(['user', 'items.product']);

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
            'status' => 'required|in:en_attente,expediee,livree,annulee',
        ]);

        $order = Order::findOrFail($id);

        $data = ['status' => $request->status];
        if ($request->status === 'livree' && !$order->delivered_at) {
            $data['delivered_at'] = now();
        }

        $order->update($data);

        return response()->json(['message' => 'Statut mis à jour', 'order' => $order]);
    }

    public function returnOrder(Request $request, $id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);

        if ($order->returned_at) {
            return response()->json(['message' => 'Cette commande a déjà été retournée'], 422);
        }

        if ($order->status !== 'livree') {
            return response()->json(['message' => 'Seules les commandes livrées peuvent être retournées'], 422);
        }

        $reference = $order->delivered_at ?? $order->created_at;
        if ($reference->diffInHours(now()) > 24) {
            return response()->json(['message' => 'La période de retour de 24 heures est expirée'], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $order->update(['returned_at' => now()]);

            DB::commit();

            return response()->json(['message' => 'Commande marquée comme retournée et le stock a été restauré', 'order' => $order->fresh(['user', 'items.product'])]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors du traitement du retour', 'error' => $e->getMessage()], 500);
        }
    }
}
