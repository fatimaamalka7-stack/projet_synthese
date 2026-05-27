<?php

namespace App\Services;

use App\Models\LoyaltySetting;

class LoyaltyService
{
    public static function getSettings(): LoyaltySetting
    {
        return LoyaltySetting::firstOrCreate([
            'id' => 1,
        ], [
            'points_per_currency' => 1.00,
            'point_value' => 0.10,
            'bronze_threshold' => 0,
            'silver_threshold' => 500,
            'gold_threshold' => 1000,
            'bronze_multiplier' => 1.00,
            'silver_multiplier' => 1.20,
            'gold_multiplier' => 1.50,
        ]);
    }

    public static function calculateLevel(int $points, ?LoyaltySetting $settings = null): string
    {
        $settings = $settings ?? self::getSettings();

        if ($points >= $settings->gold_threshold) {
            return 'Gold';
        }

        if ($points >= $settings->silver_threshold) {
            return 'Silver';
        }

        return 'Bronze';
    }

    public static function calculatePointsEarned(float $amount, string $level, ?LoyaltySetting $settings = null): int
    {
        $settings = $settings ?? self::getSettings();

        $multiplier = match (strtolower($level)) {
            'gold' => $settings->gold_multiplier,
            'silver' => $settings->silver_multiplier,
            default => $settings->bronze_multiplier,
        };

        return (int) floor($amount * $settings->points_per_currency * $multiplier);
    }

    public static function calculateRedemptionAmount(int $points, ?LoyaltySetting $settings = null): float
    {
        $settings = $settings ?? self::getSettings();

        return round($points * $settings->point_value, 2);
    }

    public static function maxRedeemablePoints(int $availablePoints, float $subtotal, ?LoyaltySetting $settings = null): int
    {
        $settings = $settings ?? self::getSettings();

        if ($settings->point_value <= 0) {
            return 0;
        }

        $maxByAmount = floor($subtotal / $settings->point_value);

        return min($availablePoints, (int) $maxByAmount);
    }
}
