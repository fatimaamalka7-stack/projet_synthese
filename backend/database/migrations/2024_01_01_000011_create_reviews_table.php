<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');
            $table->tinyInteger('rating')->unsigned()->comment('Note de 1 à 5');
            $table->text('comment');
            $table->boolean('is_validated')->default(false)
                  ->comment('Modéré par l\'admin avant publication');
            $table->timestamps();
            $table->softDeletes();

            // Un utilisateur ne peut laisser qu'un seul avis par produit
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
