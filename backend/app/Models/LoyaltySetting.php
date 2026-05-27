<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    protected $fillable = [
        'points_per_currency',
        'point_value',
        'bronze_threshold',
        'silver_threshold',
        'gold_threshold',
        'bronze_multiplier',
        'silver_multiplier',
        'gold_multiplier',
    ];
}
