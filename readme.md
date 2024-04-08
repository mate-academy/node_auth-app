# Auth application

## Description:
This is the Node.js server side for authentication where the user has the option to register, login (also reset password and login), and log out of their account. All user data and their tokens are stored in the PostgreSQL database.

Registration takes place in two stages: first, the user sends his name, email, and password (which is checked for validation) and then confirms his email by clicking on the link.
It is not possible to register more than one user per e-mail. Logging in through a Google account is also implemented.

When logging in, an access token and a refresh token are sent to the user for further confirmation of the user's authorization (the first is accepted in the body, the second in cookies).

When the user is authorized, he has access to his account, where he can change his name, e-mail (after confirmation by e-mail), password (after confirmation of the old password), and can also log out of the account.

## Extra technologies:
1) Express.js
2) Sequelize
3) jsonwebtoken
4) bcrypt
5) passport
6) nodemailer
7) eslint
8) uuid
9) dotenv
10) nodemon

## Frontend repo:
https://github.com/Soi4An/auth-app--frontend
