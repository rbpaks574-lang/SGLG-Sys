<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            BarangaySeeder::class,
            SglgCategoryRequirementSeeder::class,
            UserSeeder::class,
            AnnouncementTemplateSeeder::class,
            SubmissionSeeder::class,
        ]);
    }
}
