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

## API Endpoints

### Authentication Routes

``` POST /api/auth/register ```

Register a new user (guest only)

```
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

```GET /api/auth/activate/:token```

Activate user account via email token (guest only)

```POST /api/auth/login```

Login with credentials (guest only)

```
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

```POST /api/auth/logout```

Logout user (authenticated only)

```POST /api/auth/forgot-password```

Request password reset (guest only)

```
{
  "email": "john@example.com"
}
```

```POST /api/auth/reset-password/:token```

Reset password with token (guest only)

```
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

```POST /api/auth/refresh-token```

Refresh access token using refresh token

### User Routes

```GET /api/user/profile```

Get user profile (authenticated only)

```PUT /api/user/profile```

Update user profile (authenticated only)

```
{
  "name": "John Smith"
}
```

```PUT /api/user/change-password```

Change user password (authenticated only)

```
{
  "oldPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

```PUT /api/user/change-email```

Change user email (authenticated only)

```
{
  "password": "CurrentPass123!",
  "newEmail": "newemail@example.com"
}
```
