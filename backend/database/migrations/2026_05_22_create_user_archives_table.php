<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_archives', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('original_user_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('client');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('is_blocked')->default(false);
            $table->json('metadata')->nullable(); // Données additionnelles au moment de l'archivage
            $table->timestamp('archived_at')->useCurrent();
            $table->string('archived_by')->nullable(); // Email de l'admin qui a archivé
            $table->string('reason')->nullable(); // Raison de l'archivage
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_archives');
    }
};
