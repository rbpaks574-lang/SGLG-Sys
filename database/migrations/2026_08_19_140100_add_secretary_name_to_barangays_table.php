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
        if (Schema::hasTable('barangays') && ! Schema::hasColumn('barangays', 'secretary_name')) {
            Schema::table('barangays', function (Blueprint $table) {
                $table->string('secretary_name')->nullable()->after('captain_name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('barangays') && Schema::hasColumn('barangays', 'secretary_name')) {
            Schema::table('barangays', function (Blueprint $table) {
                $table->dropColumn('secretary_name');
            });
        }
    }
};
