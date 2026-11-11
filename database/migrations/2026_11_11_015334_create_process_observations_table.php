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
        Schema::create('process_observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workflow_stage_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category');
            $table->string('priority');
            $table->string('title');
            $table->text('detail');
            $table->string('review_status')->default('needs_review');
            $table->date('observed_on');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('process_observations');
    }
};
