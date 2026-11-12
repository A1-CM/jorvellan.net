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
        Schema::table('users', function (Blueprint $table): void {
            $table->string('google_id')->nullable()->unique();
            $table->string('password')->nullable()->change();
        });

        Schema::table('process_records', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('category')->nullable()->after('name');
            $table->unique(['user_id', 'slug']);
        });

        Schema::table('workflow_stages', function (Blueprint $table): void {
            $table->text('task_details')->nullable()->after('name');
            $table->foreignId('depends_on_stage_id')->nullable()->after('task_details')->constrained('workflow_stages')->nullOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workflow_stages', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('depends_on_stage_id');
            $table->dropColumn('task_details');
        });

        Schema::table('process_records', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'slug']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('category');
            $table->unique('slug');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['google_id']);
            $table->dropColumn('google_id');
            $table->string('password')->nullable(false)->change();
        });
    }
};
