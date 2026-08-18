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

        // 4. Sample Barangay Submitters
        $sampleBarangays = [
            ['name' => 'Barangay I (Poblacion 1)', 'email' => 'poblacion1@silang.gov.ph', 'username' => 'sec_poblacion1', 'sec_name' => 'Maria Kristina Alarcon (Sec)'],
            ['name' => 'Biga 1', 'email' => 'biga1@silang.gov.ph', 'username' => 'sec_biga1', 'sec_name' => 'Arnel P. Bautista (Sec)'],
            ['name' => 'Biluso', 'email' => 'biluso@silang.gov.ph', 'username' => 'sec_biluso', 'sec_name' => 'Grace L. Castro (Sec)'],
            ['name' => 'Acacia', 'email' => 'acacia@silang.gov.ph', 'username' => 'sec_acacia', 'sec_name' => 'Danilo V. Ramos (Sec)'],
            ['name' => 'Adlas', 'email' => 'adlas@silang.gov.ph', 'username' => 'sec_adlas', 'sec_name' => 'Rosanna T. Medina (Sec)'],
            ['name' => 'Balubad', 'email' => 'balubad@silang.gov.ph', 'username' => 'sec_balubad', 'sec_name' => 'Mark Joseph Luna (Sec)'],
            ['name' => 'Tartaria', 'email' => 'tartaria@silang.gov.ph', 'username' => 'sec_tartaria', 'sec_name' => 'Elena F. Gomez (Sec)'],
            ['name' => 'Lucsuhin', 'email' => 'lucsuhin@silang.gov.ph', 'username' => 'sec_lucsuhin', 'sec_name' => 'Carlos M. Perez (Sec)'],
        ];

        foreach ($sampleBarangays as $sb) {
            $barangay = Barangay::where('name', $sb['name'])->first();
            if ($barangay) {
                User::updateOrCreate(
                    ['email' => $sb['email']],
                    [
                        'name' => $sb['sec_name'],
                        'username' => $sb['username'],
                        'phone' => '0918-'.rand(100, 999).'-'.rand(1000, 9999),
                        'password' => $password,
                        'role' => 'barangay',
                        'barangay_id' => $barangay->id,
                        'is_active' => true,
                        'email_verified_at' => now(),
                    ]
                );
            }
        }
    }
}
