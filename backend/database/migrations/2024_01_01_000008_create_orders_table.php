<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->foreignId('coupon_id')
                  ->nullable()
                  ->constrained('coupons')
                  ->onDelete('set null');
            $table->decimal('subtotal', 10, 2)->comment('Total avant réduction');
            $table->decimal('discount_amount', 10, 2)->default(0)->comment('Montant de la réduction');
            $table->decimal('total', 10, 2)->comment('Total final après réduction');
            $table->enum('status', [
                'en_attente',
                'confirmee',
                'en_preparation',
                'expediee',
                'livree',
                'annulee',
                'remboursee',
            ])->default('en_attente');
            $table->enum('payment_method', ['livraison', 'carte', 'paypal'])
                  ->default('livraison');
            $table->enum('payment_status', ['en_attente', 'paye', 'echoue', 'rembourse'])
                  ->default('en_attente');
            // Adresse de livraison dénormalisée (snapshot au moment de la commande)
            $table->text('shipping_address');
            $table->string('shipping_city', 100)->nullable();
            $table->string('shipping_phone', 20)->nullable();
            $table->text('notes')->nullable()->comment('Notes du client');
            $table->string('tracking_number')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
