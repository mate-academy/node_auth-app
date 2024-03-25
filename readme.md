# Auth API Documentation

## Introduction
This documentation provides in-depth details of the Authentication and User Management endpoints in our API. It includes the request methods, URL paths, required parameters, and detailed response structures for each endpoint.

---

## Authentication Endpoints

### Registration
- **POST** `/auth/sign-up`
  - **Request Body**: 
    - `name` (string): User's name.
    - `email` (string): Valid email address.
    - `password` (string): Password (at least 8 characters).
    - `redirect` (string, optional): Redirect URL after successful registration.
  - **Response**: 
    - `message` (string): Confirmation of successful registration and instructions to check email for activation.

### Activation
- **GET** `/auth/activate`
  - **Query Parameters**:
    - `token` (string): Activation token.
    - `redirect` (string, optional): Redirect URL.
  - **Response**: 
    - `message` (string): Account activation status message or redirection to the specified URL.

### Login
- **POST** `/auth/login`
  - **Request Body**:
    - `email` (string): User's email.
    - `password` (string): User's password.
  - **Response**: 
    - `message` (string): Login success message.
    - `user` (object): The user's profile information.
    - Sets `refreshToken` and `accessToken` in cookies.

### Token Refresh
- **GET** `/auth/refresh`
  - **Cookies**:
    - `refreshToken` (string): Refresh token.
  - **Query Parameters**:
    - `redirect` (string, optional): Redirect URL.
  - **Response**: 
    - `message` (string): Token update confirmation or redirection to the specified URL.

### Logout
- **POST** `/auth/logout`
  - **Cookies**:
    - `refreshToken` (string): Refresh token.
    - `accessToken` (string): Access token.
  - **Response**: 
    - `message` (string): Logout success message.

### Password Reset Request
- **POST** `/auth/password-reset/request`
  - **Request Body**:
    - `email` (string): User's email.
    - `redirect` (string, optional): Redirect URL.
  - **Response**: 
    - `message` (string): Confirmation that a password reset link has been sent.

### Confirm Password Reset
- **POST** `/auth/password-reset/confirm`
  - **Request Body**:
    - `token` (string): Password reset token.
    - `password` (string): New password.
  - **Response**: 
    - `message` (string): Password reset success message.
    - `user` (object): The user's updated profile information.

---

## User Management Endpoints

### Update User Information
- **PATCH** `/users/me`
  - **Request Body**: 
    - `currentPassword` (string, required for password changes): Current password.
    - `newPassword` (string, optional): New password.
    - `newEmail` (string, optional): New email address.
  - **Response**: 
    - `messages` (array of strings): Update status messages for password and/or email.
    - `user` (object): The user's updated profile information.

### Confirm Email Update
- **POST** `/users/me/confirm-email`
  - **Request Body**:
    - `newCode` (string): Confirmation code sent to new email.
    - `oldCode` (string): Confirmation code sent to old email.
  - **Response**: 
    - `message` (string): Email update success message.
    - `user` (object): The user's updated profile information.

---

## Contributing
Contributions to this documentation are welcome. Please create an issue or submit a pull request for any suggestions or error reports.

# Auth application
Implement an application that allows user to:
- Register using name, email and password (only non authenticated)
  - Inform the users about the rules for a password and check them
  - send and activation email
- Activation page (only non authenticated)
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
