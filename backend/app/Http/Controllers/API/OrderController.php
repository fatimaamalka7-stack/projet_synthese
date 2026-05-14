<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:livraison,carte,paypal',
            'address'        => 'required|string|max:500',
        ]);

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
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($orders);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:en_attente,expediee,livree,annulee',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json(['message' => 'Statut mis à jour', 'order' => $order]);
    }
}
