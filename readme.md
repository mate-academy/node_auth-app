# Auth application
Implement an application that allows user to:
- Register using name, email and password (only non authenticated)
  - Inform the users about the rules for a password and check them
  - send and activation email
- Actvation page (only non authenticated)
  - the user should be activated only after email confirmation
  - redirect to Profile after the activation
- Login with valid credentials (email and password) (only non authenticated)
  - If user is not active ask them to activate their email
  - Redirect to profile after login
- Logout (only authenticated)
  - Redirect to login after logging out
- Password reset (only non authenticated)
  - Ask for an email
  - Show email sent page
  - add Reset Password confirmation page (with `password` and `confirmation` fields that must be equal)
  - Show Success page with a link to login
- Profile page (only authenticated)
  - You can change a name
  - It allows to change a password (require an old one, `new password` and `confirmation`)
  - To change an email you should type the password, confirm the new email and notify the old email about the change
- 404 for all the other pages

## (Optional) Advanced tasks
- Implement Sign-up with Google, Facebook, Github (use Passport.js lib)
- Profile page should allow to add/remove any social account
- Add authentication to your Accounting App

## Implemented solution

This repository now contains a complete Express authentication application with:

- registration with name, email, password rules, and activation email;
- one-time email activation with automatic sign-in and profile redirect;
- login and logout with protected/guest-only routes;
- password reset email, confirmation validation, and success page;
- authenticated profile with name, password, and email changes;
- confirmation of the new email and notification to the old email;
- HTML pages plus JSON API endpoints;
- PostgreSQL persistence through Sequelize;
- hashed passwords and hashed opaque session tokens;
- HttpOnly session cookies with SameSite protection;
- 404 handling for unknown API endpoints and pages.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and configure PostgreSQL.

3. Start the application:

```bash
npm start
```

The default address is `http://localhost:3000`.

### Email delivery

In development and tests, sent messages are kept in the email service outbox.
For real delivery, configure `MAIL_WEBHOOK_URL` with an HTTP endpoint that accepts
JSON email payloads. `MAIL_WEBHOOK_TOKEN` can be used for a Bearer token.

### API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/auth/password-rules` | Public | Password policy |
| POST | `/api/auth/register` | Guest | Register |
| GET | `/api/auth/activate/:token` | Guest | Activate account |
| POST | `/api/auth/login` | Guest | Login |
| POST | `/api/auth/logout` | Authenticated | Logout |
| POST | `/api/password/forgot` | Guest | Request reset |
| POST | `/api/password/reset/:token` | Guest | Reset password |
| GET | `/api/profile` | Authenticated | Read profile |
| PATCH | `/api/profile/name` | Authenticated | Change name |
| PATCH | `/api/profile/password` | Authenticated | Change password |
| PATCH | `/api/profile/email` | Authenticated | Change email |

### Quality checks

```bash
npm test
```

The test command runs formatting/linting, local quality checks, and the Mate
Academy Jest suite.
