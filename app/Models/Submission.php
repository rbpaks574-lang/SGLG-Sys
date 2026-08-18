<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
        'user_id',
        'category_id',
        'deadline_id',
        'title',
        'description',
        'status',
        'score',
        'is_late',
        'submitted_at',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'score' => 'float',
        'is_late' => 'boolean',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function deadline(): BelongsTo
    {
        return $this->belongsTo(Deadline::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(SubmissionChecklist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(SubmissionReview::class)->latest();
    }
}
