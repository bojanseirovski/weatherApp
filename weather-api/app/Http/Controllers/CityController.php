<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WeatherApiService;
use Exception;

class CityController extends Controller
{
    public function show(Request $request)
    {
        return response()->json(['city' => $request->user()->cityPayload()]);
    }

    public function search(Request $request, WeatherApiService $service)
    {
        try {
            $cityQuery = $service->search($request->city);
        } catch (Exception $e) {
            report($e);
            return response()->json(['message' => 'Weather service is unavailable.'], 502);
        }

        return response()->json(['cities' => $cityQuery]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'latitude' => ['required', 'string', 'max:12'],
            'longitude' => ['required', 'string', 'max:12'],
        ]);

        $user = $request->user();
        $user->forceFill([
            'city_name' => $data['name'],
            'city_lat' => $data['latitude'],
            'city_lon' => $data['longitude'],
        ])->save();

        return response()->json(['city' => $user->cityPayload()]);
    }
}
