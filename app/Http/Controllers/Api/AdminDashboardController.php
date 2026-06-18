<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InternshipApplication;
use App\Models\InternshipOffer;
use App\Models\MatchScore;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'students' => User::where('role', User::ROLE_STUDENT)->count(),
                'companies' => User::where('role', User::ROLE_COMPANY)->count(),
                'admins' => User::where('role', User::ROLE_ADMIN)->count(),
                'banned_users' => User::where('is_banned', true)->count(),
                'offers' => InternshipOffer::count(),
                'applications' => InternshipApplication::count(),
                'pending_applications' => InternshipApplication::where('status', 'pending')->count(),
                'accepted_applications' => InternshipApplication::where('status', 'accepted')->count(),
                'rejected_applications' => InternshipApplication::where('status', 'rejected')->count(),
                'average_match_score' => round((float) MatchScore::avg('score'), 2),
            ],
        ]);
    }
}
