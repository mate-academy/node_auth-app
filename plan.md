# Auth App Implementation Plan

## Context

Project goal from `readme.md`: build an authentication application with registration, email activation, login, logout, password reset, profile editing, email change confirmation, protected routes, public-only routes, and a 404 page.

Current state from `package.json`:

- The project is currently a minimal Node.js app with entry point `src/index.js`.
- Existing scripts already include Docker database helpers: `db:up`, `db:down`, `db:stop`, `db:logs`, `db:reset`.
- Prisma, backend HTTP dependencies, React, and Redux are not installed yet.

Chosen stack:

- Database: PostgreSQL in Docker.
- ORM: Prisma.
- Backend: Node.js with Express.
- Frontend: React.
- Frontend state: Redux Toolkit.

## Recommended Repository Shape

Use one repository with separate backend and frontend boundaries:

```text
.
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.js
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── utils/
│   └── validators/
└── client/
    ├── src/
    │   ├── app/
    │   ├── features/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   └── components/
    └── package.json
```

This keeps the existing backend root intact and adds the React app under `client/`.

## Phase 1: Project Setup

1. Keep the existing Docker PostgreSQL setup and verify `.env` values:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`
   - `POSTGRES_PORT`
   - `DATABASE_URL`

2. Install backend dependencies:
   - `express`
   - `cors`
   - `cookie-parser`
   - `dotenv`
   - `bcrypt`
   - `jsonwebtoken`
   - `uuid`
   - `nodemailer`
   - `zod` or `joi` for validation
   - `@prisma/client`

3. Install backend dev dependencies:
   - `prisma`
   - optionally `supertest` for API tests

4. Initialize Prisma:
   - create `prisma/schema.prisma`
   - configure PostgreSQL datasource using `DATABASE_URL`
   - generate Prisma client

5. Create the React app inside `client/`:
   - use Vite with React
   - install `@reduxjs/toolkit`
   - install `react-redux`
   - install `react-router-dom`
   - install an HTTP client, for example `axios`

## Phase 2: Database Design With Prisma

Create the core Prisma models before writing business logic.

Recommended models:

1. `User`
   - `id`
   - `name`
   - `email`
   - `passwordHash`
   - `isActivated`
   - `createdAt`
   - `updatedAt`

2. `Token`
   - `id`
   - `userId`
   - `type`
   - `token`
   - `expiresAt`
   - `createdAt`
   - relation to `User`

3. Optional `SocialAccount`
   - only needed for the advanced OAuth tasks
   - provider name
   - provider user id
   - relation to `User`

Token types to support:

- `EMAIL_ACTIVATION`
- `PASSWORD_RESET`
- `EMAIL_CHANGE`
- optionally `REFRESH_TOKEN`

After defining the schema:

1. Run Docker DB.
2. Run the first Prisma migration.
3. Generate Prisma client.
4. Add a small DB connection check in the backend startup flow.

## Phase 3: Backend Foundation

Build the backend skeleton before feature endpoints.

1. Create Express app structure:
   - `src/index.js` starts the server.
   - `src/app.js` configures Express.
   - `src/config/env.js` validates required env variables.
   - `src/utils/prisma.js` exports Prisma client.

2. Add common middleware:
   - JSON body parsing.
   - CORS configured for the React dev URL.
   - Cookie parsing if using refresh token cookies.
   - Central error handler.
   - 404 API handler.

3. Add API route prefix:
   - use `/api` for all backend routes.

4. Add auth helpers:
   - password hashing with bcrypt.
   - JWT access token creation.
   - optional refresh token creation.
   - token persistence for email activation, reset password, and email change.

5. Add mail service:
   - initially support a development mode that logs URLs to console.
   - later connect real SMTP credentials.

## Phase 4: Backend Auth Features

Implement backend endpoints in the same order as the user flow.

### 1. Registration

Endpoint:

```text
POST /api/auth/register
```

Tasks:

- Validate `name`, `email`, and `password`.
- Enforce password rules from the UI and backend validation.
- Check that email is unique.
- Hash password.
- Create inactive user.
- Create activation token.
- Send activation email.
- Return a clear success response.

### 2. Email Activation

Endpoint:

```text
GET /api/auth/activate/:token
```

Tasks:

- Validate activation token.
- Check expiration.
- Mark user as activated.
- Delete or invalidate activation token.
- Return success so the frontend can redirect to profile or login.

### 3. Login

Endpoint:

```text
POST /api/auth/login
```

Tasks:

- Validate email and password.
- Reject invalid credentials with a generic message.
- If the user is not activated, return a specific activation-required response.
- Return access token and user profile data.
- If using refresh tokens, set refresh token in an HTTP-only cookie.

### 4. Current User

Endpoint:

```text
GET /api/auth/me
```

Tasks:

- Require authentication.
- Return current user profile.
- Use this endpoint to restore frontend auth state after page reload.

### 5. Logout

Endpoint:

```text
POST /api/auth/logout
```

Tasks:

- Require authentication if access token is used.
- Clear refresh token cookie if refresh tokens are used.
- Invalidate stored refresh token if stored in DB.

### 6. Password Reset Request

Endpoint:

```text
POST /api/auth/password-reset/request
```

Tasks:

- Accept email.
- Always return a neutral response so unknown emails are not exposed.
- If user exists, create reset token.
- Send reset password email.

### 7. Password Reset Confirmation

Endpoint:

```text
POST /api/auth/password-reset/confirm
```

Tasks:

- Validate token.
- Validate `password` and `confirmation`.
- Hash new password.
- Update user password.
- Invalidate reset token.

## Phase 5: Backend Profile Features

All profile endpoints require authentication.

### 1. Update Name

Endpoint:

```text
PATCH /api/profile/name
```

Tasks:

- Validate name.
- Update current user.
- Return updated user.

### 2. Change Password

Endpoint:

```text
PATCH /api/profile/password
```

Tasks:

- Validate old password.
- Validate new password and confirmation.
- Hash and save the new password.
- Optionally invalidate existing refresh tokens.

### 3. Request Email Change

Endpoint:

```text
POST /api/profile/email-change/request
```

Tasks:

- Require current password.
- Validate new email.
- Check that new email is not already used.
- Create email change token with the new email stored in token metadata or a separate field.
- Send confirmation email to the new email.
- Notify the old email about the requested change.

### 4. Confirm Email Change

Endpoint:

```text
GET /api/profile/email-change/confirm/:token
```

Tasks:

- Validate token.
- Update user email.
- Invalidate token.
- Return success for frontend redirect.

## Phase 6: Frontend Foundation

Create the React app after backend route contracts are clear.

1. Configure React Router pages:
   - `/register`
   - `/activate/:token`
   - `/login`
   - `/password-reset`
   - `/password-reset/sent`
   - `/password-reset/confirm/:token`
   - `/password-reset/success`
   - `/profile`
   - `/email-change/confirm/:token`
   - `*` for 404

2. Add route guards:
   - `PublicOnlyRoute` for register, login, activation, and password reset pages.
   - `ProtectedRoute` for profile.

3. Configure Redux Toolkit:
   - `store`
   - `authSlice`
   - async thunks or RTK Query API layer

4. Store auth data carefully:
   - keep user data in Redux.
   - keep access token either in memory or localStorage depending on the chosen auth approach.
   - if refresh token cookies are used, restore session through `/api/auth/me`.

5. Create API service:
   - central Axios instance.
   - base URL from Vite env.
   - request interceptor for access token if needed.
   - response handling for `401`.

## Phase 7: Frontend Auth Screens

Build screens in flow order.

1. Register page:
   - fields: name, email, password.
   - show password rules before submit.
   - validate client-side.
   - after success, show message to check email.

2. Activation page:
   - read token from URL.
   - call activation endpoint.
   - show loading, success, and error states.
   - redirect after success.

3. Login page:
   - fields: email, password.
   - show activation-required message when backend returns that state.
   - redirect to profile after success.

4. Logout:
   - add button/action in authenticated UI.
   - call logout endpoint.
   - clear Redux auth state.
   - redirect to login.

5. Password reset request page:
   - ask for email.
   - redirect to email sent page after submit.

6. Password reset confirmation page:
   - fields: password and confirmation.
   - validate equality.
   - redirect to success page after submit.

7. Password reset success page:
   - show link to login.

## Phase 8: Frontend Profile Screens

1. Profile page:
   - display current user name and email.
   - load user from Redux.
   - refresh from `/api/auth/me` if needed.

2. Change name form:
   - submit to profile name endpoint.
   - update Redux user state after success.

3. Change password form:
   - fields: old password, new password, confirmation.
   - show validation errors.
   - show success state.

4. Change email form:
   - fields: new email and current password.
   - show message to confirm the new email.

5. Email change confirmation page:
   - read token from URL.
   - call confirmation endpoint.
   - update user state if authenticated.
   - show success or error state.

## Phase 9: Validation And Error Handling

Keep validation consistent between frontend and backend.

1. Define backend validation rules first.
2. Mirror the same rules in frontend forms.
3. Standardize API error response shape:

```json
{
  "message": "Human readable error",
  "fields": {
    "email": "Invalid email"
  }
}
```

4. Handle these error categories:
   - invalid input
   - invalid credentials
   - inactive user
   - expired token
   - unauthorized access
   - forbidden route
   - resource conflict, for example duplicate email
   - unknown server error

## Phase 10: Testing Plan

Start with backend tests because auth bugs are usually backend-critical.

1. Backend unit tests:
   - password hashing helper.
   - token generation and expiration logic.
   - validation schemas.

2. Backend integration tests:
   - register creates inactive user and activation token.
   - activation marks user active.
   - login rejects inactive user.
   - login succeeds after activation.
   - reset password request does not expose unknown emails.
   - reset password confirmation changes password.
   - profile endpoints require auth.

3. Frontend tests, if time allows:
   - auth slice reducers.
   - route guards.
   - important forms.

4. Manual end-to-end checklist:
   - register new user.
   - activate email.
   - login.
   - reload profile and stay authenticated.
   - update name.
   - change password.
   - logout.
   - login with new password.
   - request password reset.
   - reset password.
   - request email change.
   - confirm new email.
   - verify 404 page.

## Phase 11: Security Checklist

Before considering the task complete:

1. Never store plain passwords.
2. Use bcrypt with a reasonable salt round count.
3. Do not reveal whether an email exists during password reset.
4. Expire activation, reset, and email-change tokens.
5. Invalidate one-time tokens after successful use.
6. Protect profile routes on backend and frontend.
7. Validate all backend input.
8. Configure CORS only for the frontend origin.
9. Keep secrets in `.env`, not in source code.
10. Prefer HTTP-only cookies for refresh tokens if refresh tokens are implemented.

## Phase 12: Suggested Implementation Order

Use this exact order to avoid building frontend screens against unstable backend behavior.

1. Confirm Docker PostgreSQL starts with current `.env`.
2. Install and configure Prisma.
3. Design Prisma schema.
4. Run initial migration.
5. Create Express app structure.
6. Add env validation and Prisma client helper.
7. Add error middleware and API route structure.
8. Implement password, token, and mail helpers.
9. Implement registration.
10. Implement email activation.
11. Implement login.
12. Implement `/api/auth/me`.
13. Implement logout.
14. Implement password reset request.
15. Implement password reset confirmation.
16. Implement profile name update.
17. Implement profile password change.
18. Implement email change request.
19. Implement email change confirmation.
20. Add backend tests for the finished API.
21. Create React app in `client/`.
22. Configure routing.
23. Configure Redux store and auth slice.
24. Create API service layer.
25. Build register and activation pages.
26. Build login and logout flow.
27. Build auth restoration through `/api/auth/me`.
28. Build password reset pages.
29. Build profile page.
30. Build profile update forms.
31. Build email change confirmation page.
32. Build 404 page.
33. Run backend tests.
34. Run frontend build.
35. Do manual end-to-end verification.

## First Concrete Milestone

The first milestone should be backend-only:

1. Docker DB runs.
2. Prisma is configured.
3. `User` and `Token` models exist.
4. Registration endpoint creates an inactive user.
5. Activation endpoint activates the user.
6. Login works only after activation.
7. `/api/auth/me` returns the authenticated user.

After this milestone, the frontend can be built against stable auth contracts instead of guessed API behavior.
============================


## Current implementation status

Recent git history shows the project has already moved through these setup steps:
- backend dependencies and TypeScript backend skeleton were added
- backend tests were migrated from Jest to Vitest
- frontend was scaffolded, then migrated from `react-scripts` to Vite and Vitest
- header, routes, and the login/registration form UI were added

Current repository state:
- Backend:
  - Express app exists with `cors`, `cookie-parser`, and JSON parsing
  - one auth route exists: `POST /registration`
  - controller logic is still a stub and currently responds with `Hello!`
  - Prisma is configured, but the schema does not contain models yet
- Frontend:
  - React app exists under `src/client`
  - routes exist for home, profile, login, and 404
  - login/registration form UI exists
  - frontend form validation is started, but submit is not connected to a real auth API yet
  - protected/public route behavior is not implemented yet
- Tests:
  - backend test coverage currently checks only the registration stub response
  - frontend tests currently cover home rendering and form validation behavior

## What is done

- Project structure for separate backend and frontend work is in place
- Docker and Prisma tooling are added to the repository
- Backend app bootstrap is working and compiles
- Frontend app bootstrap is working and builds with Vite
- Basic pages and navigation exist
- Registration/login form UI exists with initial client-side validation

## What still needs to be implemented

To complete the task from this file, the project still needs these pieces:

1. Database and persistence
   - define Prisma models for `User` and token storage
   - add migrations
   - generate and use the Prisma client in backend services

2. Real backend auth flow
   - replace the registration stub with actual validation, uniqueness checks, password hashing, token creation, and activation email flow
   - add login, logout, current-user, activation, password reset, profile update, password change, and email change endpoints
   - add proper error handling and response contracts

3. Session handling
   - choose a session strategy
   - recommended baseline: `HttpOnly` cookie backed by backend session or refresh-token validation
   - add auth middleware for protected endpoints

4. Frontend auth integration
   - connect the form to the backend API
   - store auth state in frontend memory/state, not as security truth
   - restore user session from backend
   - add redirects for authenticated-only and guest-only routes

5. Missing pages and flows
   - activation result page
   - password reset request page
   - password reset confirmation page
   - success/info states for email-based flows
   - real profile editing UI

## Immediate next steps

Recommended order to finish the task:

1. Finalize Prisma schema and migration.
2. Implement real backend registration with validation and activation token generation.
3. Implement login plus session cookie strategy.
4. Add `GET /me` and auth middleware.
5. Connect the frontend form to the backend and add route guards.
6. Build the remaining activation, reset-password, logout, and profile flows.

## Environment note

- Keep backend `CLIENT_URL` aligned with the client dev server port.
- If the client runs on a different Vite port than the backend sample env expects, update `CLIENT_URL` so CORS matches the actual frontend origin.
