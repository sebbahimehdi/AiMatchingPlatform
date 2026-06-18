<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternshipOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'location',
        'internship_type',
        'required_skills',
    ];

    protected function casts(): array
    {
        return [
            'required_skills' => 'array',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class, 'offer_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function matchScores(): HasMany
    {
        return $this->hasMany(MatchScore::class, 'offer_id');
    }
}
