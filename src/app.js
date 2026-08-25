'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./api/auth.router.js');
const { usersRouter } = require('./api/users.router.js');
const { profileRouter } = require('./api/profile.router.js');
const { ApiError } = require('./utils/ApiError.js');
const { errorMiddleware } = require('./middlewares/error.middleware.js');
const { userService } = require('./services/user.service.js');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.get('/password-rules', (req, res) => {
    res.send({ rules: userService.PASSWORD_RULES });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/profile', profileRouter);

  app.use((req, res) => {
    res.status(404).send({ message: ApiError.notFound().message });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
