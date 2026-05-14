<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('type', ['percent', 'fixed'])->default('percent')
                  ->comment('percent = pourcentage, fixed = montant fixe en DH');
            $table->decimal('value', 8, 2)->comment('Valeur de la réduction');
            $table->decimal('min_order_amount', 10, 2)->default(0)
                  ->comment('Montant minimum de commande pour utiliser le coupon');
            $table->unsignedInteger('max_uses')->nullable()
                  ->comment('Nombre maximum d\'utilisations (null = illimité)');
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
