const express = require('express');
const cors = require('cors');

const authRouter = require('./apps/auth/auth.route');

const createServer = () => {
  const app = express();

  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }));

  app.use(express.json({ type: 'application/json; charset=utf-8' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/auth', authRouter);

  return app;
};

module.exports = createServer;
