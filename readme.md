# Node Auth App

A full-stack authentication application (frontend + backend) built with TypeScript, Express, Prisma, PostgreSQL, and React (Vite). The project demonstrates common auth flows: registration with email activation, login with JWT access & refresh tokens, password reset, profile updates, and session management.

Highlights
- Email activation after registration
- Secure login with access and refresh JWTs
- Password reset via tokenized email link
- Profile page with name/password/email changes
- Dockerized backend, frontend, and PostgreSQL for easy local setup

Tech stack
- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL
- Frontend: React, TypeScript, Vite
- Dev / Ops: Docker, Docker Compose

Features
- Register (name, email, password) with server-side validation and activation email
- Login / Logout with protected routes
- Password reset: request + email link + reset confirmation
- Profile page: change name, password, and email (email change sends notification)
- 404 page for unknown routes

Requirements
- Node.js (v18+ recommended)
- npm
- PostgreSQL (if running locally) or Docker & Docker Compose (recommended)

Environment variables (backend)
The backend depends on the following environment variables. Example values are shown — update them for your environment.

```
DATABASE_URL=postgresql://vladok:mytestdbpass@localhost:5432/mainTestDB?schema=sample
PORT=3001
CLIENT_HOST=localhost
CLIENT_PORT=5173
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
JWT_KEY=your_jwt_secret
JWT_REFRESH_KEY=your_jwt_refresh_secret
```

- `DATABASE_URL` — PostgreSQL connection string used by Prisma.
- `PORT` — backend server port (server default is 3002 when not specified; the project expects 3001 in Docker).
- `CLIENT_HOST` / `CLIENT_PORT` — used to build activation and reset links sent by email.
- `SMTP_USER` / `SMTP_PASS` — SMTP credentials (Gmail app password or other SMTP service) used to send emails.
- `JWT_KEY` / `JWT_REFRESH_KEY` — secrets used to sign access and refresh tokens.

Quickstart

There are two recommended ways to run this project: using Docker Compose (recommended) or running services locally.

1) Run with Docker Compose (recommended)

- Prerequisites: Docker and Docker Compose installed
- The Docker Compose file is in the `src` directory and will build and run Postgres, the backend, and the frontend.

Commands:

```bash
cd src
docker compose up --build
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

2) Run locally (no Docker)

- Start a PostgreSQL instance locally and create a database, or adapt `DATABASE_URL` to point to an existing DB.

Backend (API)

```bash
cd src/backend
npm install
# create a .env file with variables from the example above
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

This will start the backend in watch mode (using `tsx`) on the port defined in `PORT` (default 3002 if not set).

Frontend (client)

```bash
cd src/frontend
npm install
npm run dev
```

The frontend runs on port 5173 by default and expects the backend API at `http://localhost:3001`. If your backend uses a different port, update `src/frontend/src/api/client.ts` (`baseURL`) accordingly.

Database migrations

- For local development run `npx prisma migrate dev` (creates and runs migrations interactively).
- For production use `npx prisma migrate deploy` (non-interactive); the backend Dockerfile runs `npx prisma migrate deploy` during startup.

Production / Docker

- The included Dockerfiles build the backend and frontend for production. The frontend image serves static files via nginx.
- Use the Docker Compose command above to build and run everything together.

Testing & Linting

- Root project contains lint/test helpers. To run linting and tests (if any):

```bash
npm test
```

Notes & troubleshooting
- If using Gmail to send emails, prefer an app password and ensure SMTP access is enabled for the account.
- If you change ports or hosts, update `CLIENT_HOST` / `CLIENT_PORT` and the frontend `baseURL` in `src/frontend/src/api/client.ts`.
- If migrations fail, check `DATABASE_URL` and that Postgres is reachable.

Where to look in the repo
- Backend source: `src/backend`
- Frontend source: `src/frontend`
- Docker Compose: `src/docker-compose.yaml`

License
- GPL-3.0

If you want, I can also add a `.env.example` file, or update README with specific troubleshooting commands. Tell me which you'd like next.
