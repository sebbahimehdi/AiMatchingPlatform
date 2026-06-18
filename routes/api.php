<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminOfferController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyApplicantController;
use App\Http\Controllers\Api\CompanyOfferController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\StudentApplicationController;
use App\Http\Controllers\Api\StudentProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/offers', [CompanyOfferController::class, 'publicIndex']);

Route::middleware(['auth:sanctum', 'not_banned'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:student')->group(function () {
        Route::get('/profile', [StudentProfileController::class, 'show']);
        Route::post('/profile', [StudentProfileController::class, 'update']);
        Route::prefix('student')->group(function () {
            Route::post('/profile', [StudentProfileController::class, 'update']);
            Route::post('/skills', [StudentProfileController::class, 'updateSkills']);
            Route::post('/upload-cv', [StudentProfileController::class, 'uploadCv']);
        });
        Route::post('/apply', [StudentApplicationController::class, 'apply']);
        Route::get('/applications', [StudentApplicationController::class, 'index']);
        Route::get('/recommendations', [RecommendationController::class, 'index']);
    });

    Route::prefix('company')->middleware('role:company')->group(function () {
        Route::get('/profile', [CompanyProfileController::class, 'show']);
        Route::post('/profile', [CompanyProfileController::class, 'update']);
        Route::get('/offers', [CompanyOfferController::class, 'index']);
        Route::post('/offers', [CompanyOfferController::class, 'store']);
        Route::put('/offers/{offer}', [CompanyOfferController::class, 'update']);
        Route::delete('/offers/{offer}', [CompanyOfferController::class, 'destroy']);
        Route::get('/applicants/{offer}', [CompanyApplicantController::class, 'index']);
        Route::get('/applicants/{offer}/{application}/cv', [CompanyApplicantController::class, 'cv'])->name('company.applicants.cv');
        Route::patch('/applicants/{offer}/{application}', [CompanyApplicantController::class, 'update']);
    });

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        Route::get('/offers', [AdminOfferController::class, 'index']);
        Route::delete('/offers/{offer}', [AdminOfferController::class, 'destroy']);
    });
});
