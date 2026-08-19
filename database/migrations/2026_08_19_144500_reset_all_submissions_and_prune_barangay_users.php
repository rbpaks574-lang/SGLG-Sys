<?php

use App\Models\Barangay;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Wipe all existing submission data back to zero (clean slate)
        Schema::disableForeignKeyConstraints();

        DB::table('submission_files')->delete();
        DB::table('submission_checklists')->delete();
        DB::table('submission_reviews')->delete();
        DB::table('submissions')->delete();
        DB::table('notifications')->delete();
        DB::table('audit_logs')->delete();

        Schema::enableForeignKeyConstraints();

        // 2. Reset all 64 Barangays back to zero baseline (compliance score = 0.00, population = 0)
        Barangay::query()->update([
            'compliance_score' => 0.00,
            'population' => 0,
        ]);

        // 3. Keep ONLY Admins, Checkers, and the 6 Capstone Barangay Authors (Justin, Brixe, John Mark, John David, John Raymond, Jaron)
        $allowedKeywords = [
            'brixe',
            'brix',
            'justin',
            'david',
            'johnm',
            'johmm',
            'jaron',
            'paqueo',
            'paks',
            'raymond',
        ];

        $users = User::all();

        foreach ($users as $user) {
            // Keep all Admins
            if ($user->role === 'admin') {
                continue;
            }

            // Keep all Checkers
            if ($user->role === 'checker') {
                continue;
            }

            // For Barangay role users, check if they match the 5 allowed users
            $email = strtolower($user->email ?? '');
            $username = strtolower($user->username ?? '');
            $name = strtolower($user->name ?? '');

            $isAllowed = false;
            foreach ($allowedKeywords as $keyword) {
                if (
                    str_contains($email, $keyword) ||
                    str_contains($username, $keyword) ||
                    str_contains($name, $keyword)
                ) {
                    $isAllowed = true;
                    break;
                }
            }

            // Delete any user not in the allowed list (such as test accounts, paks@gmail.com, etc.)
            if (! $isAllowed) {
                $user->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation
    }
};
