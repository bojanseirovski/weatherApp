<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'city_name',
        'city_lat',
        'city_lon',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the user has the city saved in the DB
     * @return bool
     */
    public function hasCity(): bool
    {
        return $this->city_lat !== null && $this->city_lon !== null;
    }

    /**
     * Get the user city data only
     *
     * @return array
     */
    public function cityPayload(): ?array
    {
        if (! $this->hasCity()) {
            return null;
        }

        return [
            'name'      => $this->city_name,
            'latitude'  => (float) $this->city_lat,
            'longitude' => (float) $this->city_lon,
        ];
    }
}
