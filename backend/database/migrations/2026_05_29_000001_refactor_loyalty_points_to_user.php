<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'total_points')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedInteger('total_points')->default(0)->after('is_blocked');
            });
        }

        if (Schema::hasTable('loyalty_transactions')) {
            if (! Schema::hasColumn('loyalty_transactions', 'user_id')) {
                Schema::table('loyalty_transactions', function (Blueprint $table) {
                    $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                });
            }

            if (Schema::hasTable('loyalty_cards')) {
                DB::statement(
                    'UPDATE loyalty_transactions lt JOIN loyalty_cards lc ON lt.loyalty_card_id = lc.id SET lt.user_id = lc.user_id WHERE lt.user_id IS NULL'
                );
                DB::statement(
                    'UPDATE users u JOIN loyalty_cards lc ON u.id = lc.user_id SET u.total_points = lc.points WHERE u.total_points = 0'
                );
            }

            Schema::table('loyalty_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('loyalty_transactions', 'loyalty_card_id')) {
                    $table->dropForeign(['loyalty_card_id']);
                    $table->dropColumn('loyalty_card_id');
                }
            });
        }

        if (Schema::hasTable('loyalty_cards')) {
            Schema::dropIfExists('loyalty_cards');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('loyalty_transactions') && Schema::hasColumn('loyalty_transactions', 'user_id')) {
            Schema::table('loyalty_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('loyalty_transactions', 'user_id')) {
                    $table->dropForeign(['user_id']);
                    $table->dropColumn('user_id');
                }
            });
        }

        if (Schema::hasColumn('users', 'total_points')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('total_points');
            });
        }
    }
};
