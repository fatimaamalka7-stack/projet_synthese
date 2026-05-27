<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('points_per_currency', 8, 2)->default(1.00);
            $table->decimal('point_value', 8, 2)->default(0.10);
            $table->unsignedInteger('bronze_threshold')->default(0);
            $table->unsignedInteger('silver_threshold')->default(500);
            $table->unsignedInteger('gold_threshold')->default(1000);
            $table->decimal('bronze_multiplier', 4, 2)->default(1.00);
            $table->decimal('silver_multiplier', 4, 2)->default(1.20);
            $table->decimal('gold_multiplier', 4, 2)->default(1.50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_settings');
    }
};
