<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. DILG Admin (Evaluator & Manager)
        User::updateOrCreate(
            ['email' => 'admin@dilg.gov.ph'],
            [
                'name' => 'Jerome M. Lingan (MLGOO)',
                'username' => 'admin_dilg',
                'phone' => '0917-800-1001',
                'password' => $password,
                'role' => 'admin',
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@silang.gov.ph'],
            [
                'name' => 'DILG Administrator',
                'username' => 'admin',
                'phone' => '0917-800-0001',
                'password' => $password,
                'role' => 'admin',
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // 2. DILG Checker (Validator & Reviewer)
        User::updateOrCreate(
            ['email' => 'checker@dilg.gov.ph'],
            [
                'name' => 'Apolinario Mabini Jr.',
                'username' => 'checker_dilg',
                'phone' => '0917-800-1002',
                'password' => $password,
                'role' => 'checker',
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'checker@silang.gov.ph'],
            [
                'name' => 'DILG Document Validator',
                'username' => 'checker',
                'phone' => '0917-800-0002',
                'password' => $password,
                'role' => 'checker',
                'barangay_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // 3. Dedicated Barangay Test Account
        $firstBarangay = Barangay::first();
        if ($firstBarangay) {
            User::updateOrCreate(
                ['email' => 'barangay@silang.gov.ph'],
                [
                    'name' => 'Barangay Secretary (Test)',
                    'username' => 'barangay_test',
                    'phone' => '0918-123-4567',
                    'password' => $password,
                    'role' => 'barangay',
                    'barangay_id' => $firstBarangay->id,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
