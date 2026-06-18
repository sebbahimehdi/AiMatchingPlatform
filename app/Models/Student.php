<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'city',
        'university',
        'degree',
        'field_of_study',
        'experience_title',
        'experience_description',
        'skills',
        'cv_path',
        'preferred_technologies',
        'internship_type',
        'preferred_location',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'preferred_technologies' => 'array',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class);
    }

    public function matchScores(): HasMany
    {
        return $this->hasMany(MatchScore::class);
    }

    public function skillTags(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'student_skills')->withTimestamps();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<int, string>
     */
    public function skillNames(): array
    {
        if ($this->relationLoaded('skillTags') && $this->skillTags->isNotEmpty()) {
            return $this->skillTags->pluck('name')->values()->all();
        }

        return $this->skills ?? [];
    }
}
