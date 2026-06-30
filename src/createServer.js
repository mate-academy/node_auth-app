const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // ⚡️ Додали
const { sequelize } = require('./db');
const { userRouter } = require('./routes/User.router');

function createServer() {
  const app = express();

  sequelize.sync({ force: false });

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use('/', userRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'Page not found' });
  });

  return app;
}

module.exports = { createServer };
