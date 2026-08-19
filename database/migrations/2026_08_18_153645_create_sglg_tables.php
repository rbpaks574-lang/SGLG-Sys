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
        // 1. Barangays (Silang, Cavite - 64 Barangays)
        Schema::create('barangays', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->string('captain_name')->nullable();
            $table->string('secretary_name')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('pollution_status')->default('Low / Managed');
            $table->integer('population')->default(0);
            $table->decimal('compliance_score', 5, 2)->default(0.00);
            $table->timestamps();
        });

        // 2. Enhance Users table with role, username, phone, barangay_id, is_active, last_login_at, current_session_id
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['admin', 'checker', 'barangay'])->default('barangay')->after('password');
            $table->foreignId('barangay_id')->nullable()->after('role')->constrained('barangays')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('barangay_id');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->string('current_session_id')->nullable()->after('last_login_at');
        });

        // 3. SGLG Categories (6 Core & Essential Governance Areas)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->default('FileText');
            $table->integer('weight')->default(15);
            $table->boolean('is_core')->default(true);
            $table->timestamps();
        });

        // 4. Document Requirements Masterlist
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name');
            $table->enum('frequency', ['monthly', 'quarterly', 'semestral', 'annual'])->default('quarterly');
            $table->text('description')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->timestamps();
        });

        // 5. Fixed DILG Deadlines
        Schema::create('deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('due_date');
            $table->integer('target_year')->default(2026);
            $table->string('target_period')->default('Q1');
            $table->timestamps();
        });

        // 6. Submissions
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->foreignId('deadline_id')->nullable()->constrained('deadlines')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'under_review', 'verified', 'returned', 'forwarded'])->default('pending');
            $table->decimal('score', 5, 2)->default(0.00);
            $table->boolean('is_late')->default(false);
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 7. Submission Attached Files (Multi-file upload: PDF, DOCX, Images)
        Schema::create('submission_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->cascadeOnDelete();
            $table->string('original_name');
            $table->string('file_path');
            $table->bigInteger('file_size')->default(0);
            $table->string('file_type')->default('pdf');
            $table->string('mime_type')->nullable();
            $table->timestamps();
        });

        // 8. Submission Checklists
        Schema::create('submission_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->cascadeOnDelete();
            $table->string('requirement_name');
            $table->boolean('is_checked')->default(false);
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();
        });

        // 9. Submission Reviews & Remarks
        Schema::create('submission_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->cascadeOnDelete();
            $table->foreignId('checker_id')->constrained('users')->cascadeOnDelete();
            $table->enum('action', ['verified', 'returned', 'under_review', 'forwarded']);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // 10. Broadcast Announcements
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->enum('target_role', ['all', 'barangay', 'checker'])->default('all');
            $table->boolean('is_pinned')->default(false);
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->timestamps();
        });

        // 11. Document Templates
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->bigInteger('file_size')->default(0);
            $table->timestamps();
        });

        // 12. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('barangay_id')->nullable()->constrained('barangays')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info');
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 13. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->text('description');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('document_templates');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('submission_reviews');
        Schema::dropIfExists('submission_checklists');
        Schema::dropIfExists('submission_files');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('deadlines');
        Schema::dropIfExists('document_requirements');
        Schema::dropIfExists('categories');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['barangay_id']);
            $table->dropColumn(['username', 'phone', 'role', 'barangay_id', 'is_active', 'last_login_at']);
        });

        Schema::dropIfExists('barangays');
    }
};
