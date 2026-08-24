# Northstar authentication

A complete server-rendered authentication application built with Node.js and
Express. It includes registration, email activation, login/logout, password
recovery, and protected profile settings.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). In local development,
outgoing messages are stored in the development inbox at
[http://localhost:3000/dev/emails](http://localhost:3000/dev/emails), so all
email links can be tested without configuring an external provider.

Copy `.env.example` to `.env` or provide its values through your runtime. A
production deployment must set a stable `SESSION_SECRET` of at least 32
characters and set `APP_URL` to its public origin. Set `RESEND_API_KEY` and
`MAIL_FROM` to deliver real email through Resend.

## Included flows

- Registration with visible and server-enforced password rules
- Single-use, expiring account activation links
- Protected login, logout, and profile routes
- Enumeration-safe password recovery with expiring reset links
- Profile name updates and authenticated password changes
- Confirmed email changes with notifications to the previous address
- Branded success, expired-link, and 404 pages

Passwords use Node's scrypt implementation with a unique salt. Session IDs and
email tokens are cryptographically random; email tokens are stored only as
SHA-256 digests. The app also uses signed HTTP-only cookies, CSRF protection,
rate limiting, strict security headers, and generic recovery responses.

Persistent local data is written atomically to `data/auth.json`, which is
ignored by Git. Email bodies are copied to the development inbox only outside
production.

## Validation

```bash
npm test
```

The test suite covers activation-gated login, password validation, CSRF,
route guards, password recovery, profile updates, email confirmation, logout,
and the 404 fallback.
