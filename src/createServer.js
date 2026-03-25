/* eslint-disable max-len */
'use strict';

require('./src/models/index');

const express = require('express');
const cors = require('cors');

const { usersRouter } = require('./api/users.router');
const { expensesRouter } = require('./api/expenses.router');
const { categoriesRouter } = require('./api/categories.router');
const { authRouter } = require('./api/auth.router');
const cookieParser = require('cookie-parser');

const createServer = () => {
  const app = express();

  // Налаштування CORS
  app.use(
    cors({
      origin: process.env.CLIENT_URL, // Дозволяємо запити тільки з нашого React-клієнта
      credentials: true, // Дозволяємо передачу куків (знадобиться для JWT пізніше)
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use('/users', usersRouter);
  app.use('/expenses', expensesRouter);
  app.use('/categories', categoriesRouter);
  app.use('/auth', authRouter);

  app.use((req, res, next) => {
    res.status(404).json({ message: 'Page not found' });
  });

  return app;
};

module.exports = {
  createServer,
};
