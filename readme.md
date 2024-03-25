# Auth API Documentation

## Introduction
This documentation provides in-depth details of the Authentication and User Management endpoints in my API. It includes the request methods, URL paths, required parameters, and detailed response structures for each endpoint.

---

## Authentication Endpoints

### Registration
- **POST** `/auth/sign-up`
  - **Request Body**: 
    - `name` (string): User's name.
    - `email` (string): Valid email address.
    - `password` (string): Password (at least 8 characters).
    - `redirect` (string, optional): Redirect URL after successful email activation.
  - **Response**: 
    - `message` (string): Confirmation of successful registration and instructions to check email for activation.

### Activation
- **GET** `/auth/activate`
  - **Query Parameters**:
    - `token` (string): The activation token that was sent in the activated mail link.
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

### Tokens Refresh
- **GET** `/auth/refresh`
  - **Cookies**:
    - `refreshToken` (string): Refresh token.
  - **Query Parameters**:
    - `redirect` (string, optional): Redirect URL.
  - **Response**: 
    - `message` (string): Token update confirmation or redirection to the specified URL.
  **Note**: Mostly, if the accessToken is outdated, the api automatically redirects to refresh.

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
    - `message` (string): Confirmation that a password reset link has been sent on email.

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
    - `password` (string, optional): New password.
    - `email` (string, optional): New email address. Don't update immediately, but send letters with confirmations to two emails.
    - `name` (string, optional): New user name.
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

**Note**: Access to User Management Endpoints requires an `accessToken` provided in the cookie.

---

## (Optional) Advanced tasks
- Implement Sign-up with Google, Facebook, Github (use Passport.js lib)
- Profile page should allow to add/remove any social account
- Add authentication to your Accounting App
