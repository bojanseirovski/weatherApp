<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;
use Throwable;

class WeatherApiService
{
    public function forecast(string $city, int $days = 6)
    {
        if (!$city) {
            throw new Exception('Missing city in Weather service call.');
        }
        $response = Http::baseUrl(config('services.weather_api.url'))
            ->timeout(5)
            ->retry(2, 200)
            ->get('forecast.json', [
                'q' => $city,
                'days' => $days,
                'limit' => $days,
                'key' => config('services.weather_api.key'),
            ])
            ->throw()
            ->json();

        if (isset($response['error'])) {
            throw new Exception($response['error']['message']);
        }
        if (!$response['current'] || !$response['forecast']) {
            throw new Exception('No forecast for the specified location:' . $city);
        }

        $forecastDays = [];

        for ($i = 0; $i < $days; $i++) {
            $dailyForecast = $response['forecast']['forecastday'][$i];
            $dayData = $dailyForecast['day'];
            $forecastDays[] = [
                'date' => $dailyForecast['date'],
                'maxtemp' => $dayData['maxtemp_c'],
                'mintemp' => $dayData['mintemp_c'],
                'avgtemp' => $dayData['avgtemp_c'],
                'avghumidity' => $dayData['avghumidity'],
                'condition' => $dayData['condition']['text'],
                'condition_icon' => $dayData['condition']['icon'],
            ];
        }

        return $forecastDays;
    }

    public function search(string $query)
    {
        if (!$query){
            Throw new Exception('Empty city query.');
        } 
        try {
            $results = Http::baseUrl(config('services.weather_api.url'))
                ->timeout(5)
                ->get('/search.json', [
                    'key' => config('services.weather_api.key'),
                    'q'   => $query,
                ])
                ->throw()
                ->json();
        } catch (Exception $e) {
            report($e);
            return ['message' => 'City search is unavailable.'];
        }

        $cities = [];

        foreach ($results as $result) {
            $cities[] = [
                'id'        => $result['id'],
                'name'      => $result['name'],
                'region'    => $result['region'],
                'country'   => $result['country'],
                'latitude'  => $result['lat'],
                'longitude' => $result['lon'],
            ];
        }

        return $cities;
    }
}
