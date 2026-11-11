<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('improvement_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('process_observation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('owner');
            $table->string('priority');
            $table->string('status');
            $table->date('due_on')->nullable();
            $table->text('outcome')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('improvement_actions');
    }
};
