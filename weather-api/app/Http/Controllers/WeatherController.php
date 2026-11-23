<?php

namespace App\Http\Controllers;

use App\Services\WeatherApiService;
use Exception;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function show(Request $request, WeatherApiService $service)
    {
        $user = $request->user();

        if (! $user->city_name) {
            return response()->json(['message' => 'User has no city.'], 409);
        }

        try {
            $forecast = $service->forecast($user->city_name);
        } catch (Exception $e) {
            report($e);
            return response()->json(['message' => 'Weather service is unavailable.'], 502);
        }

        return response()->json(['days' => $forecast]);
    }
}
