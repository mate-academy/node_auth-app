/* eslint-disable */
const env = require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/auth.routes.js');
const { userRouter } = require('./routes/user.routes.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

const createServer = () => {
  const app = express();
  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(authRouter);
  app.use('/users', userRouter);

  app.get('/', (req, res) => {
    res.send('Hello');
  });
  
  app.use((req, res) => {
    res.sendStatus(404);
  });

  app.use(errorMiddleware);
  return app;
};

module.exports = {
  createServer,
};
