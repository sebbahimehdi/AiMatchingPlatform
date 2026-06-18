<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case Accepted = 'accepted';
    case Pending = 'pending';
    case Rejected = 'rejected';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
