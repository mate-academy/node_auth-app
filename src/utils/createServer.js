'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRouter } = require('../routes/auth.router');
const { userRouter } = require('../routes/user.router');
const { errorMiddleware } = require('../middlewares/errorMiddleware');
const expenseRouter = require('../routes/expense.router');
const categoryRouter = require('../routes/category.router');
const passport = require('passport');
const session = require('express-session');
const { client } = require('./db');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

require('./passport');

require('dotenv').config();

function createServer() {
  const app = express();

  app.use(cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  const sessionStore = new SequelizeStore({
    db: client,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
  });

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: sessionStore,
  }));

  sessionStore.sync();

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', authRouter);
  app.use('/user', userRouter);
  app.use('/expenses', expenseRouter);
  app.use('/categories', categoryRouter);

  app.use(errorMiddleware);

  return app;
}

module.exports = { createServer };
