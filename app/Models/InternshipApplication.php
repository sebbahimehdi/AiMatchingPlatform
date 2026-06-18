<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternshipApplication extends Model
{
    use HasFactory;

    protected $table = 'applications';

    protected $fillable = ['student_id', 'offer_id', 'status'];

    public function offer(): BelongsTo
    {
        return $this->belongsTo(InternshipOffer::class, 'offer_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
