<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class MatchScore extends Model
{
    protected $fillable = ['student_id', 'offer_id', 'score'];

    protected function casts(): array
    {
        return [
            'score' => 'float',
        ];
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(InternshipOffer::class, 'offer_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
