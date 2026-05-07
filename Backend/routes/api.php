<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PlayerController;
use App\Http\Controllers\NewsController;

Route::apiResource('players', PlayerController::class);
Route::apiResource('news', NewsController::class);