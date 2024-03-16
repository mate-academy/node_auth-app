# Auth Accounting App

This is a a backend server built using Express and Node.js. It provides user authentication functionalities such as registration, login, logout and change of user data along with accounting features including managing expenses and categories.

## Features

- **Local Authentication**: Allows to register new users using the provided registration endpoint, log in with registered credentials to obtain a JWT token, access protected routes by including the JWT token in the request headers.
- **Third-party Authentication**: Enables authentication via social accounts (Google, Github) with Passport.js strategies.
- **User Profile Management**: Allows to change username, email a password, connect social accounts (Google, Github).
- **Expense Management**: Enables users to add, edit, and delete expenses, enables expenses filtering and sorting.
- **Category Management**: Allows users to organize expenses into different categories, add, edit and delete categories.

## Stack

- **Express.js**
- **Node.js**
- **Sequelize ORM with PostgreSQL**: used for data storage and management.
- **JWT (jsonwebtoken)**: used to provide refresh and access tokens for local authentication.
- **Passport.js**: used for third-party authentication (Google, Github).
- **express-session**: used for session management.
- **CORS**: used to handle CORS to allow requests from specified origins.
- **Nodemailer**: used to send emails for email activation, password reset, etc.

## Getting Started

To run this application locally, follow these steps:

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Add the .env file according to the provided .env.sample file with personal credentials and client host.
4. Run the setup.js file in order to synchronize the database.
5. Run the index.js file in order to start the server.
6. Once the server is running, you can test the endpoints using tools like Postman or by integrating with a [frontend application](https://github.com/akozlovska/react_auth-app).
