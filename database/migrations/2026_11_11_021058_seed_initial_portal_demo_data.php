<?php

use Database\Seeders\PortalPlanSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(PortalPlanSeeder::class)->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Sample rows may be referenced by simulated checkout records.
    }
};
