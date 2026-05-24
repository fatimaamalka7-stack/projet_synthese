<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
<<<<<<< HEAD
    protected $fillable = ['user_id','total','status','payment_method','address','admin_seen_at','delivered_at','returned_at'];

    protected $casts = [
        'admin_seen_at' => 'datetime',
        'delivered_at' => 'datetime',
        'returned_at' => 'datetime',
=======
    protected $fillable = ['user_id','total','status','payment_method','address','admin_seen_at'];

    protected $casts = [
        'admin_seen_at' => 'datetime',
>>>>>>> origin/ayat
    ];

    public function user()    { return $this->belongsTo(User::class); }
    public function items()   { return $this->hasMany(OrderItem::class); }
    public function payment() { return $this->hasOne(Payment::class); }
}
