const express = require('express');
const authRouter = require('../src/routes/auth.route');
const { sequelize } = require('./config/db');
const userRouter = require('./routes/user.route');

const server = () => {
  const app = express();

  // registering middleware
  app.use(express.json());
  // registering route
  app.use('/auth', authRouter);
  app.use('/user', userRouter);
  // sync DB
  sequelize.sync({ force: false });

  return app;
};

module.exports = server;
