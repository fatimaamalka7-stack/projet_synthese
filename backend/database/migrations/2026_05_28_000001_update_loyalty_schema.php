<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loyalty_cards', function (Blueprint $table) {
            if (! Schema::hasColumn('loyalty_cards', 'last_order_at')) {
                $table->timestamp('last_order_at')->nullable()->after('lifetime_points');
            }

            if (Schema::hasColumn('loyalty_cards', 'level')) {
                $table->dropColumn('level');
            }
        });

        Schema::table('loyalty_settings', function (Blueprint $table) {
            foreach (['bronze_threshold', 'silver_threshold', 'gold_threshold', 'bronze_multiplier', 'silver_multiplier', 'gold_multiplier'] as $column) {
                if (Schema::hasColumn('loyalty_settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('loyalty_transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('loyalty_transactions', 'amount')) {
                $table->decimal('amount', 10, 2)->default(0)->after('points');
            }
        });
    }

    public function down(): void
    {
        Schema::table('loyalty_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('loyalty_transactions', 'amount')) {
                $table->dropColumn('amount');
            }
        });

        Schema::table('loyalty_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('loyalty_settings', 'bronze_threshold')) {
                $table->unsignedInteger('bronze_threshold')->default(0);
            }
            if (! Schema::hasColumn('loyalty_settings', 'silver_threshold')) {
                $table->unsignedInteger('silver_threshold')->default(500);
            }
            if (! Schema::hasColumn('loyalty_settings', 'gold_threshold')) {
                $table->unsignedInteger('gold_threshold')->default(1000);
            }
            if (! Schema::hasColumn('loyalty_settings', 'bronze_multiplier')) {
                $table->decimal('bronze_multiplier', 8, 2)->default(1.00);
            }
            if (! Schema::hasColumn('loyalty_settings', 'silver_multiplier')) {
                $table->decimal('silver_multiplier', 8, 2)->default(1.20);
            }
            if (! Schema::hasColumn('loyalty_settings', 'gold_multiplier')) {
                $table->decimal('gold_multiplier', 8, 2)->default(1.50);
            }
        });

        Schema::table('loyalty_cards', function (Blueprint $table) {
            if (! Schema::hasColumn('loyalty_cards', 'level')) {
                $table->string('level')->nullable()->after('points');
            }
            if (Schema::hasColumn('loyalty_cards', 'last_order_at')) {
                $table->dropColumn('last_order_at');
            }
        });
    }
};
