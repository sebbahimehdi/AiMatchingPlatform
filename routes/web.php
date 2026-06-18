<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'AI Internship Matcher API',
        'status' => 'ok',
        'docs' => [
            'auth' => ['/api/register', '/api/login', '/api/logout'],
            'student' => ['/api/profile', '/api/apply', '/api/applications', '/api/recommendations'],
            'company' => ['/api/company/profile', '/api/company/offers', '/api/company/applicants/{offer}'],
            'admin' => ['/api/admin/dashboard', '/api/admin/users', '/api/admin/offers'],
        ],
    ]);
});
