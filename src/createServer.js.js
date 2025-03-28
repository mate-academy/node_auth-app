const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routers/auth.router');
const { errorMiddleware } = require('./middlewares/error.middleware');
const cookieParser = require('cookie-parser');
const { profileRouter } = require('./routers/profile.router');
const { authMiddleware } = require('./middlewares/auth.middleware');

function createServer() {
  const app = express();

  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(authRouter);
  app.use('/profile', authMiddleware, profileRouter);
  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createServer,
};
