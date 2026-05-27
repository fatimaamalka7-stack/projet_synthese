<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyCard;
use App\Models\LoyaltyTransaction;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function myCard(Request $request)
    {
        $settings = LoyaltyService::getSettings();

        $card = LoyaltyCard::firstOrCreate([
            'user_id' => $request->user()->id,
        ], [
            'points' => 0,
            'level' => LoyaltyService::calculateLevel(0, $settings),
            'lifetime_points' => 0,
        ]);

        $card->load(['transactions' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(20);
        }]);

        return response()->json(['card' => $card, 'settings' => $settings]);
    }

    public function adminCards(Request $request)
    {
        $cards = LoyaltyCard::with('user')
            ->orderBy('points', 'desc')
            ->paginate(15);

        return response()->json($cards);
    }

    public function adminUpdateCard(Request $request, $id)
    {
        $card = LoyaltyCard::findOrFail($id);
        $request->validate([
            'points' => 'required|integer|min:0',
            'level' => 'nullable|string|in:Bronze,Silver,Gold',
        ]);

        $card->points = $request->points;
        $card->level = $request->level ?: LoyaltyService::calculateLevel($card->points);
        $card->save();

        return response()->json(['message' => 'Carte fidélité mise à jour', 'card' => $card]);
    }

    public function adminSettings()
    {
        return response()->json(LoyaltyService::getSettings());
    }

    public function adminUpdateSettings(Request $request)
    {
        $settings = LoyaltyService::getSettings();

        $request->validate([
            'points_per_currency' => 'required|numeric|min:0',
            'point_value' => 'required|numeric|min:0',
            'silver_threshold' => 'required|integer|min:0',
            'gold_threshold' => 'required|integer|min:0',
            'bronze_multiplier' => 'required|numeric|min:0',
            'silver_multiplier' => 'required|numeric|min:0',
            'gold_multiplier' => 'required|numeric|min:0',
        ]);

        $settings->update($request->only([
            'points_per_currency',
            'point_value',
            'silver_threshold',
            'gold_threshold',
            'bronze_multiplier',
            'silver_multiplier',
            'gold_multiplier',
        ]));

        return response()->json(['message' => 'Paramètres fidélité mis à jour', 'settings' => $settings]);
    }
}
