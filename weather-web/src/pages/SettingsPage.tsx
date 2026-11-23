import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../lib/api';

type SavedCity = {
    name: string
    latitude: number
    longitude: number
}

type CityResult = {
    id: number
    name: string
    region: string
    country: string
    latitude: number
    longitude: number
}

function cityLabel(city: CityResult) {
    return [city.name].filter(Boolean).join(', ');
}

async function searchCities(query: string): Promise<CityResult[]> {
    const data = await api<{ cities: CityResult[] }>(
        `/city/search?city=${encodeURIComponent(query)}`,
    );
    return data.cities;
}

export default function SettingsPage() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();

    const [currentCity, setCurrentCity] = useState<SavedCity | null>(null);
    const [loading, setLoading] = useState(true);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CityResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<CityResult | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleError(err: unknown, message: string) {
        if (err instanceof ApiError && err.status === 401) {
            logout();
            return;
        }
        setError(message);
    }

    async function loadCity() {
        setLoading(true);
        setError(null);

        try {
            const data = await api<{ city: SavedCity | null }>('/city');
            setCurrentCity(data.city);
        } catch (err) {
            handleError(err, "Couldn't load city.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCity();
    }, [])

    useEffect(() => {
        const q = query.trim();

        if (q.length < 2) {
            setResults([]);
            setSearching(false);
            return;
        }

        let ignore = false;
        setSearching(true);

        const timer = setTimeout(async () => {
            try {
                const cities = await searchCities(q);
                if (!ignore) {
                    setResults(cities);
                }
            } catch (err) {
                if (!ignore) {
                    setResults([]);
                    handleError(err, 'City search failed. Please try again.');
                }
            } finally {
                if (!ignore) {
                    setSearching(false);
                }
            }
        }, 300)

        return () => {
            ignore = true;
            clearTimeout(timer);
        }
    }, [query]);

    function handleQueryChange(value: string) {
        setQuery(value);
        setSelected(null);
        setError(null);
    }

    function chooseCity(city: CityResult) {
        setSelected(city);
        setQuery(cityLabel(city));
        setResults([]);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selected) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api('/city', {
                method: 'POST',
                body: JSON.stringify({
                    name: selected.name,
                    latitude: String(selected.latitude),
                    longitude: String(selected.longitude),
                }),
            });

            if (user) {
                setUser({ ...user, has_city: true });
            }
            navigate('/dashboard');
        } catch (err) {
            handleError(err, "Couldn't save your city. Please try again.");
            setSaving(false);
        }
    }

    const showNoResults =
        query.trim().length >= 2 && !searching && !selected && results.length === 0;

    return (
        <section className="card profile">
            <h1>Settings</h1>

            {!loading && !currentCity && (
                <p className="banner">Choose or update city to see the forecast.</p>
            )}

            <div className="field">
                <span className="label">User</span>
                <span>{user?.name}</span>
            </div>

            <div className="field">
                <span className="label">Email</span>
                <span>{user?.email}</span>
            </div>

            <div className="field">
                <span className="label">Current city</span>
                <span>{loading ? 'Loading…' : currentCity?.name ?? 'Not set'}</span>
            </div>

            <form className="city-form" onSubmit={handleSubmit}>
                <label>
                    {currentCity ? 'Change city' : 'Choose city'}
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="Start typing a city name…"
                        disabled={loading || saving}
                        autoComplete="off"
                    />
                </label>

                {searching && <p className="muted">Searching…</p>}

                {results.length > 0 && (
                    <ul className="results">
                        {results.map((city) => (
                            <li key={city.id}>
                                <button type="button" onClick={() => chooseCity(city)}>
                                    {cityLabel(city)}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {showNoResults && <p className="muted">No cities found.</p>}

                {error && (
                    <p className="error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={!selected || saving}>
                    {saving ? 'Saving…' : 'Save city'}
                </button>
            </form>
        </section>
    )
}