<?php

namespace Database\Factories;

use App\Models\ActivityEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityEntry>
 */
class ActivityEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'action' => 'created',
            'subject_type' => 'process',
            'subject_id' => fake()->numberBetween(1, 1000),
            'summary' => fake()->sentence(),
            'metadata' => [],
        ];
    }
}
