# Node.js Authentication API

A complete authentication system built with Node.js, Express, TypeScript, and Prisma.

## Features

- **User Registration** with email and password validation
- **Email Confirmation** with activation links
- **Login/Logout** with JWT tokens
- **Password Reset** functionality
- **Profile Management** (update name, email, password)
- **Refresh Token** system for persistent sessions
- **Secure Password Hashing** with bcrypt
- **CORS** configuration for frontend integration
- **Input Validation** and error handling

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Gmail account for sending emails

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd node_auth-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy `env.example` to `.env` and configure:

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/node_auth"
   JWT_ACCESS_SECRET="your-access-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   CLIENT_URL="http://localhost:5173"
   PORT=3000
   EMAIL_USER="your-gmail@gmail.com"
   EMAIL_PASS="your-gmail-app-password"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `POST /auth/registration` - Register a new user
- `GET /auth/activation/:email/:token` - Activate account
- `POST /auth/login` - Login user
- `GET /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/password-reset-request` - Request password reset
- `POST /auth/password-reset/:email/:token` - Reset password

### Profile Management

- `GET /profile` - Get user profile (authenticated)
- `PUT /profile/name` - Update user name (authenticated)
- `PUT /profile/password` - Update password (authenticated)
- `PUT /profile/email` - Update email (authenticated)

### Users

- `GET /users` - Get all active users (authenticated)

## Request/Response Examples

### Registration

```bash
POST /auth/registration
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "jwt-token"
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Tokens**: Access tokens (10min) and refresh tokens (7 days)
- **Email Verification**: Users must verify their email before login
- **Password Reset**: Secure token-based password reset
- **CORS**: Configured for secure cross-origin requests
- **Input Validation**: Comprehensive validation for all inputs

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Database Schema

The application uses Prisma with the following models:

- **User**: Stores user information, activation tokens, and reset tokens
- **Token**: Stores refresh tokens for session management

## License

GPL-3.0
