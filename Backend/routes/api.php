<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\NewsController;

// Tus rutas actuales
Route::apiResource('news', NewsController::class);

// Auth
Route::post('/register', [
    AuthController::class,
    'register'
]);

Route::post('/login', [
    AuthController::class,
    'login'
]);

// Rutas protegidas JWT
Route::middleware('auth:api')->group(function () {

    Route::get('/posts', [
        PostController::class,
        'index'
    ]);

    Route::post('/posts', [
        PostController::class,
        'store'
    ]);

    Route::put('/posts/{id}', [
        PostController::class,
        'update'
    ]);

    Route::delete('/posts/{id}', [
        PostController::class,
        'destroy'
    ]);
});