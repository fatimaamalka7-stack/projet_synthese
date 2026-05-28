<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyCard extends Model
{
    protected $fillable = ['user_id', 'points', 'lifetime_points', 'last_order_at'];

    protected $casts = [
        'last_order_at' => 'datetime',
        'points' => 'integer',
        'lifetime_points' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }
}
