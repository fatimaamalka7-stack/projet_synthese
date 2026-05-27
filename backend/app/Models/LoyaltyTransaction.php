<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyTransaction extends Model
{
    protected $fillable = ['loyalty_card_id', 'type', 'points', 'description', 'order_id'];

    public function loyaltyCard()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
