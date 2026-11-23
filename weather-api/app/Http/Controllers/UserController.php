<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function show(Request $request)
    {
        return response()->json(['user' => self::get($request->user())]);
    }

    public static function get(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'has_city' => $user->hasCity(),
            'city_name' => $user->city_name,
            'city_lat' => $user->city_lat,
            'city_lon' => $user->city_lon,
        ];
    }
}
