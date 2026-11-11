# Auth App

Authentication app: registration with email activation, login/logout,
password reset, and a profile page (change name, password, email).

- **Server:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, JWT, Nodemailer
- **Client:** Angular 17 (standalone), Angular Material

## Requirements

- Node.js 22 for the server, Node.js 20 for the client
- PostgreSQL
- An SMTP account (e.g. Gmail with an app password)

## Server

```bash
cd server
npm install
cp .env.example .env    # fill in the values
npx prisma migrate deploy
npx prisma generate
npm start               # http://localhost:3005
```

### Environment variables

| Variable                                               | Description                               |
| ------------------------------------------------------ | ----------------------------------------- |
| `PORT`                                                 | Server port (default 3005)                |
| `CLIENT_HOST`                                          | Client URL, used for CORS and email links |
| `DATABASE_URL`                                         | PostgreSQL connection string              |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Email sending                             |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`              | Random strings for signing tokens         |

## Client

```bash
cd client
npm install
npm start               # http://localhost:4200
```

## How authentication works

- **Access token:** a short-lived JWT (15 min), kept in memory and sent as `Authorization: Bearer`.
- **Refresh token:** a long-lived JWT (30 days), in an httpOnly cookie and stored in the DB, so it can be revoked.
- On a 401 the client refreshes once and retries the request; on startup it restores the session via `/auth/refresh`.

## API

| Method | Path                          | Access        |
| ------ | ----------------------------- | ------------- |
| POST   | `/auth/register`              | guest         |
| GET    | `/auth/activate/:token`       | guest         |
| POST   | `/auth/login`                 | guest         |
| GET    | `/auth/refresh`               | cookie        |
| POST   | `/auth/logout`                | authenticated |
| POST   | `/auth/reset-password`        | guest         |
| POST   | `/auth/reset-password/:token` | guest         |
| GET    | `/profile`                    | authenticated |
| PATCH  | `/profile/name`               | authenticated |
| PATCH  | `/profile/password`           | authenticated |
| PATCH  | `/profile/email`              | authenticated |
