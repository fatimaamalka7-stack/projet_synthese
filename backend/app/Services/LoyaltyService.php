<?php

namespace App\Services;

class LoyaltyService
{
    public const POINTS_PER_CURRENCY = 1;
    public const POINT_VALUE = 0.10;

    public static function getSettings(): array
    {
        return [
            'points_per_currency' => self::POINTS_PER_CURRENCY,
            'point_value' => self::POINT_VALUE,
        ];
    }

    public static function calculatePointsEarned(float $amount): int
    {
        return (int) floor($amount * self::POINTS_PER_CURRENCY);
    }

    public static function calculateRedemptionAmount(int $points): float
    {
        return round($points * self::POINT_VALUE, 2);
    }

    public static function maxRedeemablePoints(int $availablePoints, float $subtotal): int
    {
        if (self::POINT_VALUE <= 0) {
            return 0;
        }

        $maxByAmount = (int) floor($subtotal / self::POINT_VALUE);

        return min($availablePoints, $maxByAmount);
    }
}
