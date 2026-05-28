<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyTransaction;
use App\Models\User;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function myCard(Request $request)
    {
        $user = $request->user();
        $transactions = LoyaltyTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $card = [
            'points' => (int) $user->total_points,
            'possible_discount' => round($user->total_points * LoyaltyService::POINT_VALUE, 2),
            'transactions' => $transactions,
        ];

        return response()->json([
            'card' => $card,
            'settings' => LoyaltyService::getSettings(),
        ]);
    }

    public function adminCards(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search);
            });
        }

        if ($request->filled('min_points')) {
            $query->where('total_points', '>=', (int) $request->min_points);
        }

        if ($request->filled('max_points')) {
            $query->where('total_points', '<=', (int) $request->max_points);
        }

        if ($request->filled('filter') && $request->filter === 'more100') {
            $query->where('total_points', '>=', 100);
        }

        $query->withSum(['loyaltyTransactions as lifetime_points' => fn ($q) => $q->where('points', '>', 0)], 'points');

        if ($request->filled('filter')) {
            if ($request->filter === 'best') {
                $query->orderBy('lifetime_points', 'desc');
            } elseif ($request->filter === 'few') {
                $query->orderBy('total_points', 'asc');
            } else {
                $query->orderBy('total_points', 'desc');
            }
        } else {
            $query->orderBy('total_points', 'desc');
        }

        $cards = $query->paginate($request->input('per_page', 15));

        return response()->json($cards);
    }

    public function adminUpdateCard(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'points' => 'required|integer|min:0',
            'comment' => 'nullable|string|max:500',
        ]);

        $oldPoints = $user->total_points;
        $user->total_points = $request->points;
        $user->save();

        if ($oldPoints !== $user->total_points) {
            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'type' => 'adjustment',
                'points' => $user->total_points - $oldPoints,
                'description' => $request->comment ?: 'Ajustement manuel de points',
                'order_id' => null,
                'amount' => 0,
            ]);
        }

        return response()->json(['message' => 'Solde fidélité mis à jour', 'card' => $user]);
    }

    public function adminAdjustCard(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'type' => 'required|in:add_points,remove_points,special_discount',
            'points' => 'nullable|integer|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'comment' => 'nullable|string|max:500',
        ]);

        $description = $request->comment ?: 'Action fidélité manuelle';
        $transactionData = [
            'user_id' => $user->id,
            'description' => $description,
            'order_id' => null,
            'amount' => 0,
        ];

        if ($request->type === 'add_points') {
            $points = (int) $request->points;
            if ($points <= 0) {
                return response()->json(['message' => 'Le nombre de points doit être supérieur à zéro'], 422);
            }
            $user->increment('total_points', $points);
            $transactionData['type'] = 'manual_add';
            $transactionData['points'] = $points;
        } elseif ($request->type === 'remove_points') {
            $points = (int) $request->points;
            if ($points <= 0) {
                return response()->json(['message' => 'Le nombre de points doit être supérieur à zéro'], 422);
            }
            if ($points > $user->total_points) {
                return response()->json(['message' => 'Impossible de retirer plus de points que disponibles'], 422);
            }
            $user->decrement('total_points', $points);
            $transactionData['type'] = 'manual_remove';
            $transactionData['points'] = -$points;
        } else {
            $discountAmount = (float) $request->discount_amount;
            if ($discountAmount <= 0) {
                return response()->json(['message' => 'Le montant de la remise doit être supérieur à zéro'], 422);
            }
            $transactionData['type'] = 'manual_discount';
            $transactionData['points'] = 0;
            $transactionData['amount'] = $discountAmount;
        }

        $user->save();
        LoyaltyTransaction::create($transactionData);

        return response()->json(['message' => 'Action fidélité enregistrée', 'card' => $user]);
    }
}
