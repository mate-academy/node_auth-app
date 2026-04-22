'use strict';

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const { passport } = require('./config/passport');
const { authRouter } = require('./routes/auth.routes');
const { userRouter } = require('./routes/user.routes');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      'development-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());

app.use('/', authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

module.exports = { app };
