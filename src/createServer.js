'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.routes');
const { profileRouter } = require('./routes/profile.routes');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { PASSWORD_RULES } = require('./utils/validatePassword');

function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Auth API is running',
    });
  });

  app.get('/password-rules', (req, res) => {
    res.status(200).json({
      rules: PASSWORD_RULES,
    });
  });

  app.use(authRouter);
  app.use(profileRouter);

  app.use((req, res) => {
    res.status(404).json({
      message: 'Page not found',
    });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createServer,
};
