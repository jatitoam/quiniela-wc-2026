# JWT: localStorage access token + httpOnly refresh cookie

**Updated 2026-05-10** — supersedes the original in-memory approach. Cookie config corrected (see Addendum).

Access tokens (5-minute expiry) are stored in `localStorage` under the key `quiniela_auth`, alongside the serialised `UserDto`. The refresh token remains in an httpOnly, Secure, SameSite=Lax cookie scoped to `path=/api/auth/refresh`. On page load the stored token is hydrated synchronously into React context, so the user appears logged in immediately with no network round-trip. When the access token expires the client gets a 401 and calls `POST /api/auth/refresh` transparently.

## Why we moved away from in-memory

The original design stored the access token only in React context. This meant any page reload destroyed the token, forcing a blocking network call (`POST /auth/refresh`) before the app could render authenticated state. That round-trip caused a visible flicker and felt broken to users.

## Trade-off accepted

`localStorage` is readable by JavaScript, so XSS can steal the access token. We accept this risk because:

- The access token expiry is cut from 30 minutes to **5 minutes**, limiting the attacker's window.
- The refresh token stays in an httpOnly cookie and is never accessible to scripts.
- An XSS payload could also call `/auth/refresh` directly (the cookie is sent automatically with `credentials: 'include'`), obtaining a fresh access token from the response body. The httpOnly cookie prevents *passive exfiltration* of the long-lived credential; it does not prevent session abuse during an active XSS attack. The 5-minute TTL is the primary mitigation.
- This is an internal company app with a small, trusted user base; the XSS surface is low.

`sessionStorage` was considered but rejected — it dies when the tab closes, which still forces a refresh round-trip on every new tab. `localStorage` gives a genuinely persistent session across reloads and tabs.

## What did not change

- Refresh token storage: httpOnly cookie, 30-day expiry, `Secure` in production.
- Refresh flow: `POST /api/auth/refresh` is called on 401 responses (transparent retry in `api/client.ts`).
- Logout: clears both the cookie (backend) and `localStorage` (frontend).

## Addendum — cookie config corrected (2026-05-10)

During Vercel + Supabase deployment setup a latent bug was discovered: the refresh cookie was originally set with `path: '/auth/refresh'` (missing the `/api` global prefix). Browsers only send cookies whose `path` attribute is a prefix of the request URL, so the cookie was never sent to `/api/auth/refresh`. This silently broke the refresh flow since the feature was introduced.

The `clearCookie` call on logout also omitted the matching options, leaving the cookie uncleared in the browser.

Fixed in the same commit: `path: '/api/auth/refresh'`, `sameSite: 'lax'` (changed from `'strict'` — `lax` is appropriate under same-origin Vercel deployment and harmless locally), and `clearCookie` now passes the full matching cookie options.
