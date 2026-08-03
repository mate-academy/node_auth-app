const express = require('express');
const authRouter = require('./routes/auth.route.js');
const cookieParser = require('cookie-parser');
const { notFound } = require('./middlewares/notFound.js');

function createApp() {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());

  app.use('/auth', authRouter);

  app.use(notFound);

  return app;
}

module.exports = {
  createApp,
};
