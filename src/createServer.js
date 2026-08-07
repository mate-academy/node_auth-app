'use strict';

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.routes');
const { profileRouter } = require('./routes/profile.routes');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { PASSWORD_RULES } = require('./utils/validatePassword');

const CLIENT_DIR = path.join(__dirname, '..', 'public');

function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use('/app', express.static(CLIENT_DIR));

  app.get('/app/*splat', (req, res) => {
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
  });

  app.get('/', (req, res) => {
    res.redirect('/app/');
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
