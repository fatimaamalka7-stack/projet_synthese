<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getOrCreateCart($userId)
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }

    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request->user()->id);
        $cart->load('items.product');

        $total = $cart->items->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        return response()->json([
            'cart'  => $cart,
            'total' => $total,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json(['message' => 'Stock insuffisant'], 422);
        }

        $cart = $this->getOrCreateCart($request->user()->id);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($item) {
            $newQty = $item->quantity + $request->quantity;
            if ($product->stock < $newQty) {
                return response()->json(['message' => 'Stock insuffisant'], 422);
            }
            $item->update(['quantity' => $newQty]);
        } else {
            CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $request->product_id,
                'quantity'   => $request->quantity,
            ]);
        }

        $cart->load('items.product');
        return response()->json(['message' => 'Produit ajouté au panier', 'cart' => $cart]);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $item = CartItem::findOrFail($id);

        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($item->product->stock < $request->quantity) {
            return response()->json(['message' => 'Stock insuffisant'], 422);
        }

        $item->update(['quantity' => $request->quantity]);

        return response()->json(['message' => 'Quantité mise à jour', 'item' => $item]);
    }

    public function remove(Request $request, $id)
    {
        $item = CartItem::findOrFail($id);

        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $item->delete();

        return response()->json(['message' => 'Produit supprimé du panier']);
    }

    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request->user()->id);
        $cart->items()->delete();

        return response()->json(['message' => 'Panier vidé']);
    }
}
