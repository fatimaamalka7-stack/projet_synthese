<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'method'   => 'required|in:livraison,carte,paypal',
            'amount'   => 'required|numeric|min:0',
        ]);

        $order = Order::where('user_id', $request->user()->id)
            ->findOrFail($request->order_id);

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount'   => $request->amount,
            'method'   => $request->method,
            'status'   => $request->method === 'livraison' ? 'en_attente' : 'complete',
        ]);

        if ($payment->status === 'complete') {
            $order->update(['status' => 'en_attente']);
        }

        return response()->json([
            'message' => 'Paiement enregistré',
            'payment' => $payment,
        ], 201);
    }
}
