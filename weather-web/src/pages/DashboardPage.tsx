import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../lib/api';
import type { Forecast } from '../types/weather';

export default function DashboardPage() {
    const {user,  logout } = useAuth();
    const navigate = useNavigate();

    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const formatted = date.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            weekday: 'short',
            day:'numeric'
        });

        return formatted.toString();
    }

    async function loadWeather() {
        setLoading(true);
        setError(null);

        try {
            const data = await api<Forecast>('/weather');
            setForecast(data);
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                navigate('/profile', { replace: true });
                return;
            }
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError("Couldn't load the forecast. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWeather();
    }, [])

    return (
        <section>
            {error && <p className="banner" role="alert">{error}</p>}

            {!forecast && loading && <p className="muted">Loading forecast…</p>}

            {forecast && <h1>Forecast for {user?.city_name}</h1>}

            {forecast && (
                <div className="forecast">
                    {forecast.days.map((day, i) => (
                        <article key={i} className="card day">
                            <h2>{formatDate(day.date)}</h2>
                            <p className="temps">
                                <span className="high">{day.maxtemp ?? '—'}°</span>
                                {' / '}
                                <span className="low">{day.mintemp ?? '—'}°</span>
                            </p>
                            <p className="muted">{day.condition}</p>
                            {day.condition_icon && <p><img src={day.condition_icon}/></p>}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}