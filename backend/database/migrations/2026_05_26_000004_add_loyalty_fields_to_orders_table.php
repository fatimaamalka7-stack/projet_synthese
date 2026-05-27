<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->unsignedInteger('points_redeemed')->default(0);
            $table->decimal('redemption_amount', 10, 2)->default(0);
            $table->unsignedInteger('loyalty_points_earned')->default(0);
            $table->string('loyalty_level_at_order')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'points_redeemed', 'redemption_amount', 'loyalty_points_earned', 'loyalty_level_at_order']);
        });
    }
};
