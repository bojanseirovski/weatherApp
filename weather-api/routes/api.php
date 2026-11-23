<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'show']);
    Route::get('/city', [CityController::class, 'show']);
    Route::get('/city/search', [CityController::class, 'search']);
    Route::post('/city', [CityController::class, 'save']);
    Route::get('/weather', [WeatherController::class, 'show']);
});
