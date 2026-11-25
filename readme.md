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

## How to run

### Server
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=3005

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=postgres

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

CLIENT_HOST=http://localhost:5173

JWT_KEY=your_secret
JWT_REFRESH_KEY=your_refresh_secret
```

```bash
node setup.js
npm start
```

### Client
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Credits
Earth image: "The Blue Marble", NASA / Apollo 17 crew (public domain, via Wikimedia Commons)