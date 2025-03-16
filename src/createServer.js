const express = require('express');

require('dotenv/config');

const authRouter = require('./routes/auth.route.js');
const cors = require('cors');
const userRouter = require('./routes/user.route.js');
const errorMiddleware = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

const app = express();

const createServer = () => {
  app.use(express.static('public'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use(authRouter);
  app.use('/users', userRouter);
  app.use(errorMiddleware);

  return app;
};

module.exports = createServer;
