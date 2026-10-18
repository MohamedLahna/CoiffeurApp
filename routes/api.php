<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminGoogleAuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TranslationController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/admin/auth/google', [AdminGoogleAuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/translations', [TranslationController::class, 'translate'])->middleware('throttle:30,1');

Route::get('/services', fn () => \App\Models\Service::where('is_active', true)->with('addons')->get());
Route::get('/barbers', fn () => \App\Models\User::where('role', 'barber')
    ->whereHas('profile', fn ($query) => $query->where('is_active', true))
    ->with('profile')->get());
Route::get('/availability', [AppointmentController::class, 'slots']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments', fn () => request()->user()->appointments()
        ->with(['barber', 'services.service'])->latest()->get());
    Route::patch('/appointments/{appointment}', function (Request $request, \App\Models\Appointment $appointment) {
        abort_unless($appointment->client_id === $request->user()->id, 403);
        $appointment->update($request->validate(['status' => 'required|in:cancelled']));

        return $appointment;
    });
});

Route::prefix('admin')->middleware(['auth:sanctum', EnsureAdmin::class])->group(function () {
    Route::get('/auth/me', [AdminGoogleAuthController::class, 'me']);
    Route::post('/auth/logout', [AdminGoogleAuthController::class, 'logout']);
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::get('/barbers', [AdminController::class, 'barbers']);
    Route::post('/barbers', [AdminController::class, 'storeBarber']);
    Route::patch('/barbers/{barber}', [AdminController::class, 'updateBarber']);
    Route::get('/barbers/{barber}/schedules', [AdminController::class, 'barberSchedules']);
    Route::get('/services', [AdminController::class, 'services']);
    Route::post('/services', [AdminController::class, 'storeService']);
    Route::patch('/services/{service}', [AdminController::class, 'updateService']);
    Route::delete('/services/{service}', [AdminController::class, 'deleteService']);
    Route::post('/addons', [AdminController::class, 'storeAddon']);
    Route::patch('/addons/{addon}', [AdminController::class, 'updateAddon']);
    Route::delete('/addons/{addon}', [AdminController::class, 'deleteAddon']);
    Route::get('/appointments', [AdminController::class, 'appointments']);
    Route::patch('/appointments/{appointment}', [AdminController::class, 'updateAppointment']);
    Route::get('/schedules', [AdminController::class, 'schedules']);
    Route::patch('/schedules/{schedule}', [AdminController::class, 'updateSchedule']);
});
