<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'stock', 'category_id',
        'image', 'matiere', 'tailles', 'couleurs'
    ];

    protected $appends = ['image_url', 'average_rating'];

    public function getImageUrlAttribute()
    {
        if (! $this->image) {
            return null;
        }

        if (Str::startsWith($this->image, ['http://', 'https://'])) {
            return $this->image;
        }

        return asset('storage/' . $this->image);
    }

    public function getAverageRatingAttribute()
    {
        return round($this->reviews()->where('is_validated', true)->avg('rating'), 1);
    }

    public function category()   { return $this->belongsTo(Category::class); }
    public function reviews()    { return $this->hasMany(Review::class); }
    public function cartItems()  { return $this->hasMany(CartItem::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
}
