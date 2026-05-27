<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY status ENUM('en_attente','confirmee','expediee','livree','annulee','retournee') NOT NULL DEFAULT 'en_attente'");
        } else {
            Schema::table('orders', function (Blueprint $table) {
                $table->enum('status', ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee', 'retournee'])->default('en_attente')->change();
            });
        }
    }

    public function down()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY status ENUM('en_attente','expediee','livree','annulee') NOT NULL DEFAULT 'en_attente'");
        } else {
            Schema::table('orders', function (Blueprint $table) {
                $table->enum('status', ['en_attente', 'expediee', 'livree', 'annulee'])->default('en_attente')->change();
            });
        }
    }
};
