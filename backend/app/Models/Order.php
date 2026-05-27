<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Order extends Model {
    protected $fillable = ['user_id','subtotal','total','points_redeemed','redemption_amount','loyalty_points_earned','loyalty_level_at_order','status','payment_method','address','admin_seen_at','delivered_at','returned_at','stock_restored_at'];

    protected $casts = [
        'admin_seen_at' => 'datetime',
        'delivered_at' => 'datetime',
        'returned_at' => 'datetime',
        'stock_restored_at' => 'datetime',
    ];

    public function user()    { return $this->belongsTo(User::class); }
    public function items()   { return $this->hasMany(OrderItem::class); }
    public function payment() { return $this->hasOne(Payment::class); }
    public function returnRequests() { return $this->hasMany(ReturnRequest::class); }

    public function cancellationDeadline(): ?Carbon
    {
        $reference = $this->delivered_at ?? $this->created_at;
        return $reference ? $reference->copy()->addHours(24) : null;
    }

    public function canBeCanceledOrReturned(): bool
    {
        if ($this->status === 'annulee' || $this->status === 'retournee' || $this->returned_at) {
            return false;
        }

        $deadline = $this->cancellationDeadline();
        return $deadline ? now()->lessThanOrEqualTo($deadline) : false;
    }

    public function hasRestoredStock(): bool
    {
        return $this->stock_restored_at !== null;
    }
}
