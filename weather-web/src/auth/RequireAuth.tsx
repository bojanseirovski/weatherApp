import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

export default function RequireAuth() {
    const { status } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <div className="center">Loading…</div>;
    }
    if (status === 'guest') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}