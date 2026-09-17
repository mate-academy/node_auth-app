const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routers/auth.router');
const profileRouter = require('./routers/profile.routers');
const passport = require('./utils/passport');

const createServer = () => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.use('/auth', authRouter);
  app.use('/profile', profileRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  return app;
};

module.exports = { createServer };
