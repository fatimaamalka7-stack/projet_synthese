<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')
                  ->constrained('carts')
                  ->onDelete('cascade');
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');
            $table->unsignedInteger('quantity')->default(1);
            $table->string('selected_size')->nullable()->comment('Taille choisie par le client');
            $table->string('selected_color')->nullable()->comment('Couleur choisie par le client');
            $table->timestamps();

            // Un même produit (avec la même taille/couleur) ne peut apparaître qu'une fois par panier
            $table->unique(['cart_id', 'product_id', 'selected_size', 'selected_color'], 'cart_items_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
