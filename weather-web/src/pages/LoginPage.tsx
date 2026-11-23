import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'

export default function LoginPage() {
    const { status, user, login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    if (status === 'authenticated') {
        return <Navigate to={user?.has_city ? '/dashboard' : '/profile'} replace />
    }

    if (status === 'loading') return <div className="center">Loading…</div>

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            await login(email.trim(), password)
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setError('Incorrect email or password')
            } else {
                setError('Something went wrong. Please try again.')
            }
            setSubmitting(false)
        }
    }

    return (
        <div className="center">
            <form className="card login" onSubmit={handleSubmit} noValidate>
                <h1>Sign in</h1>

                <label>
                    Email
                    <input
                        type="email"
                        name="email"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={submitting}
                    />
                </label>

                {error && (
                    <p className="error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={submitting || !email || !password}>
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    )
}