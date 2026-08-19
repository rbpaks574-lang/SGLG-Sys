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
        if (Schema::hasTable('submission_files') && ! Schema::hasColumn('submission_files', 'is_revision')) {
            Schema::table('submission_files', function (Blueprint $table) {
                $table->boolean('is_revision')->default(false)->after('mime_type');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('submission_files') && Schema::hasColumn('submission_files', 'is_revision')) {
            Schema::table('submission_files', function (Blueprint $table) {
                $table->dropColumn('is_revision');
            });
        }
    }
};
