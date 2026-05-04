# JWT: in-memory access token + httpOnly refresh cookie

Access tokens (30-minute expiry) are stored in React context (in-memory), not localStorage. The refresh token is stored in an httpOnly, Secure, SameSite=Strict cookie. On page load the frontend silently re-issues the access token via the refresh endpoint before rendering protected content.

localStorage was rejected because it is readable by any JavaScript on the page, making it vulnerable to XSS. An httpOnly cookie is not accessible to scripts at all. The silent re-issue on page load adds one network round-trip but removes the entire class of token-theft via XSS.
