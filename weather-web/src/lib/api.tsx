const TOKEN_KEY = 'weather.token';

export const tokenStore = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, data: unknown) {
        const message =
            (data as { message?: string } | null)?.message ?? `Request failed (${status})`;
        super(message);
        this.status = status;
        this.data = data;
    }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = tokenStore.get();

    const res = await fetch(`/api${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(res.status, data);
    }

    return data as T;
}