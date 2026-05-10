// In dev the Vite proxy rewrites /api → http://localhost:3000, so BASE_URL is /api.
// In production set VITE_API_URL to the full Railway backend URL (e.g. https://api.example.up.railway.app/api).
export const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

let _getToken: (() => string | null) | null = null;

export function initApiClient(getToken: () => string | null) {
  _getToken = getToken;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = _getToken?.();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' });

  if (res.status === 401) {
    const refreshed = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) {
      const data = (await refreshed.json()) as { accessToken: string };
      window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: data }));
      headers['Authorization'] = `Bearer ${data.accessToken}`;
      const retry = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' });
      if (!retry.ok) throw new ApiError(retry.status, await retry.text());
      return retry.json() as Promise<T>;
    }
    window.dispatchEvent(new Event('auth:expired'));
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
};
