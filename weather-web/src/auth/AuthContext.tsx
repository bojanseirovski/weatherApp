import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';

export type User = {
    id: number
    name: string
    email: string
    city_name: string
    has_city: boolean
}

type AuthStatus = 'loading' | 'authenticated' | 'guest';

type AuthContextValue = {
    user: User | null
    status: AuthStatus
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>(tokenStore.get() ? 'loading' : 'guest');

    useEffect(() => {
        if (!tokenStore.get()) { 
            return;
        }

        api<{ user: User }>('/user')
            .then(({ user }) => {
                setUserState(user);
                setStatus('authenticated');
            })
            .catch(() => {
                tokenStore.clear()
                setStatus('guest');
            })
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        const { token, user } = await api<{ token: string; user: User }>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        tokenStore.set(token);
        setUserState(user);
        setStatus('authenticated');
    }, [])

    const logout = useCallback(async () => {
        try {
            await api('/logout', { method: 'POST' });
        } finally {
            tokenStore.clear();
            setUserState(null);
            setStatus('guest');
        }
    }, []);

    const setUser = useCallback((u: User) => setUserState(u), []);

    const value = useMemo(
        () => ({ user, status, login, logout, setUser }),
        [user, status, login, logout, setUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}