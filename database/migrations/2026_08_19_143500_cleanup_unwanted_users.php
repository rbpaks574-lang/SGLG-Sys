<?php

use App\Models\Announcement;
use App\Models\DocumentTemplate;
use App\Models\Submission;
use App\Models\SubmissionReview;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $admin = User::where('role', 'admin')->first();
        $adminId = $admin?->id;

        $keepKeywords = [
            'brixe',
            'brix',
            'justin',
            'david',
            'johnm',
            'johmm',
            'john',
            'jaron',
        ];

        $users = User::all();

        foreach ($users as $user) {
            // Keep all admins
            if ($user->role === 'admin') {
                continue;
            }

            // Keep all checkers
            if ($user->role === 'checker') {
                continue;
            }

            // Check if name, username, or email matches keep list
            $lowerName = strtolower($user->name);
            $lowerUsername = strtolower($user->username ?? '');
            $lowerEmail = strtolower($user->email);

            $shouldKeep = false;
            foreach ($keepKeywords as $keyword) {
                if (
                    str_contains($lowerName, $keyword) ||
                    str_contains($lowerUsername, $keyword) ||
                    str_contains($lowerEmail, $keyword)
                ) {
                    $shouldKeep = true;
                    break;
                }
            }

            if ($shouldKeep) {
                continue;
            }

            // Reassign foreign references to admin before deleting so no submission or template data is lost
            if ($adminId && $user->id !== $adminId) {
                Submission::where('user_id', $user->id)->update(['user_id' => $adminId]);
                Submission::where('verified_by', $user->id)->update(['verified_by' => $adminId]);
                SubmissionReview::where('checker_id', $user->id)->update(['checker_id' => $adminId]);
                Announcement::where('user_id', $user->id)->update(['user_id' => $adminId]);
                DocumentTemplate::where('user_id', $user->id)->update(['user_id' => $adminId]);
            }

            // Delete the unwanted user
            $user->delete();
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
