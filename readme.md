# Auth application

Full-stack authentication application with React frontend and Node.js backend.

## Features

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
- Sign-up with Google OAuth

## Setup and Running

### Frontend Setup

1. Clone the frontend repository:

```bash
git clone https://github.com/mrsvolodya/Auth.git
cd Auth
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in the root directory with the following variables:

```env
VITE_API_URL=http://localhost:3005
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Start the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3005
NODE_ENV=development

# Database Configuration
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=auth_db
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_KEY=your-jwt-secret-key
JWT_REFRESH_KEY=your-jwt-refresh-secret-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_HOST=http://localhost:5173

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

3. Initialize database tables:

```bash
node setup.js
```

4. Start the backend server:

```bash
npm start
```

The backend API will be available at http://localhost:3005

## Important Notes

- Make sure you have PostgreSQL installed and running
- For Google OAuth to work, you need to set up a project in Google Cloud Console and get the client ID and secret
- For email functionality, you need to set up an email account with app-specific password

## (Optional) Advanced tasks

- Implement Sign-up with Facebook, Github (use Passport.js lib)

* Profile page should allow to add/remove any social account
* Add authentication to your Accounting App
