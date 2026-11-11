<?php

use Database\Seeders\PortalDemoSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(PortalDemoSeeder::class)->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Sample rows may be referenced by simulated checkout records.
    }
};
