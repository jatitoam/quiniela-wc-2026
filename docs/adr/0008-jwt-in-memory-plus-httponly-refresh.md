# JWT: localStorage access token + httpOnly refresh cookie

**Updated 2026-05-10** — supersedes the original in-memory approach.

Access tokens (5-minute expiry) are stored in `localStorage` under the key `quiniela_auth`, alongside the serialised `UserDto`. The refresh token remains in an httpOnly, Secure, SameSite=Strict cookie. On page load the stored token is hydrated synchronously into React context, so the user appears logged in immediately with no network round-trip. A background silent-refresh call still runs on mount to obtain a fresh token and keep the session alive.

## Why we moved away from in-memory

The original design stored the access token only in React context. This meant any page reload destroyed the token, forcing a blocking network call (`POST /auth/refresh`) before the app could render authenticated state. That round-trip caused a visible flicker and felt broken to users.

## Trade-off accepted

`localStorage` is readable by JavaScript, so XSS can steal the access token. We accept this risk because:

- The access token expiry is cut from 30 minutes to **5 minutes**, limiting the attacker's window.
- The refresh token stays in an httpOnly cookie and is never accessible to scripts.
- This is an internal company app with a small, trusted user base; the XSS surface is low.

`sessionStorage` was considered but rejected — it dies when the tab closes, which still forces a refresh round-trip on every new tab. `localStorage` gives a genuinely persistent session across reloads and tabs.

## What did not change

- Refresh token storage: httpOnly cookie, 30-day expiry.
- Refresh flow: `POST /auth/refresh` is called on 401 responses and once on mount as a background keep-alive.
- Logout: clears both the cookie (backend) and `localStorage` (frontend).
