<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\StripeClient;

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

    public function createIntent(Request $request)
    {
        // Compute amount from user's cart to avoid trusting client input
        $cart = \App\Models\Cart::where('user_id', $request->user()->id)->with('items.product')->first();
        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Panier vide'], 422);
        }

        $amount = $cart->items->sum(fn($i) => $i->quantity * $i->product->price);

        $stripeSecret = env('STRIPE_SECRET');
        if (! $stripeSecret) {
            return response()->json(['message' => 'Stripe not configured'], 500);
        }

        $stripe = new StripeClient($stripeSecret);

        $pi = $stripe->paymentIntents->create([
            'amount' => (int) round($amount * 100),
            'currency' => env('STRIPE_CURRENCY', 'usd'),
            'metadata' => [ 'user_id' => $request->user()->id ],
        ]);

        return response()->json(['client_secret' => $pi->client_secret]);
    }

    public function sendCardVerificationCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        if (in_array(config('mail.default', 'log'), ['log', 'array'], true)) {
            return response()->json([
                'message' => 'Envoi email non configure. Configurez MAIL_MAILER=smtp dans le fichier .env.',
            ], 500);
        }

        if (!config('mail.mailers.smtp.username') || !config('mail.mailers.smtp.password') || !config('mail.from.address')) {
            return response()->json([
                'message' => 'SMTP incomplet. Ajoutez MAIL_USERNAME, MAIL_PASSWORD et MAIL_FROM_ADDRESS dans .env.',
            ], 500);
        }

        $code = (string) random_int(100000, 999999);
        $cacheKey = self::cardVerificationCacheKey($request->user()->id, $validated['email']);

        try {
            Mail::raw(
                "Bonjour,\n\nVotre code de verification pour valider le paiement par carte est : {$code}\n\nCe code expire dans 10 minutes.",
                function ($message) use ($validated) {
                    $message->to($validated['email'])
                        ->subject('Code de verification paiement carte');
                }
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Impossible d envoyer l email de verification. Verifiez la configuration SMTP.',
            ], 500);
        }

        Cache::put($cacheKey, $code, now()->addMinutes(10));

        Log::info('Card payment verification email sent', [
            'user_id' => $request->user()->id,
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'Code de verification envoye par email',
            'email' => $validated['email'],
        ]);
    }

    public static function cardVerificationCacheKey(int $userId, string $email): string
    {
        return 'card_payment_verification:'.$userId.':'.sha1(strtolower(trim($email)));
    }
}
