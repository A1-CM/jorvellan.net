<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PortalPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            ['name' => 'Explore', 'slug' => 'explore', 'audience' => 'For individual evaluation', 'summary' => 'A guided, read-only look at the Jorvellan sample workspace.', 'price_cents' => 0, 'features' => ['Sample operations dashboard', 'Illustrative process records', 'No account required'], 'is_demo' => true, 'sort_order' => 1],
            ['name' => 'Team', 'slug' => 'team', 'audience' => 'For focused improvement teams', 'summary' => 'A draft plan for a small team organizing process records and review.', 'price_cents' => 4900, 'features' => ['Up to 10 team members', 'Process registry and workflow maps', 'Observation and action tracking', 'Monthly review workspace'], 'is_demo' => false, 'sort_order' => 2],
            ['name' => 'Operations', 'slug' => 'operations', 'audience' => 'For cross-functional operations', 'summary' => 'A draft plan for teams coordinating multiple departments and improvement programs.', 'price_cents' => 14900, 'features' => ['Up to 40 team members', 'Unlimited process records', 'Cross-department review views', 'Priority support'], 'is_demo' => false, 'sort_order' => 3],
        ];

        foreach ($plans as $plan) {
            Plan::query()->updateOrCreate(['slug' => $plan['slug']], [...$plan, 'currency' => 'USD', 'billing_period' => 'month', 'is_active' => true]);
        }
    }
}
