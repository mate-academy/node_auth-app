/* eslint-disable max-len */
/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const { router: expensesRouter } = require('./routes/expenses');
const { router: statsRouter } = require('./routes/stats');
const { router: authRouter } = require('./routes/auth');

const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

const { localStrategy } = require('./authStrategies/local');
const { catchError } = require('./middlewares/catchError');
const { authMiddleware } = require('./middlewares/authMiddleware');

require('dotenv').config();

const {
  HOST = 'localhost',
  PORT = 5000,
  SESSION_SECRET = 'secret',
  CLIENT_URL,
} = process.env;

const app = express();

passport.use('local', localStrategy);

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(session({
  secret: SESSION_SECRET,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
}));

app.use(cookieParser());
app.use(express.json());

app.use('/expenses', catchError(authMiddleware), expensesRouter);
app.use('/stats', catchError(authMiddleware), statsRouter);
app.use('/auth', authRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`
    Server is running on http://${HOST}:${PORT}
    Available endpoints:
    - expenses
      GET http://${HOST}:${PORT}/expenses
      GET http://${HOST}:${PORT}/expenses/:expenseId
      POST http://${HOST}:${PORT}/expenses
      PATCH http://${HOST}:${PORT}/expenses/:expenseId
      DELETE http://${HOST}:${PORT}/expenses/:expenseId
    - stats (can be combined)
      GET http://${HOST}:${PORT}/stats?from={startDate}&to={endDate}
      GET http://${HOST}:${PORT}/stats?user={userName}
      GET http://${HOST}:${PORT}/stats?category={categoryTitle}[&category={categoryTitle}...]
  `);
});
