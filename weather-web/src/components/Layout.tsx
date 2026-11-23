import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout();
        navigate('/login', { replace: true });
    }

    return (
        <div className="app">
            <header className="header">
                <span className="brand">Weather App</span>

                <nav className="nav">
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/settings">Settings</NavLink>
                </nav>

                <div className="user">
                    <span>{user?.name}</span>
                    <button type="button" onClick={handleLogout}>Log out</button>
                </div>
            </header>

            <main className="main">
                <Outlet />
            </main>

            <footer className="footer">

            </footer>
        </div>
    )
}