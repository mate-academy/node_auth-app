const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.router');
const { userRouter } = require('./routes/user.router');

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.use('/auth', authRouter);
  app.use('/profile', userRouter);

  return app;
}

module.exports = { createServer };
