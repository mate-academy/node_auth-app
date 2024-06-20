const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');

require('dotenv').config();

const api = require('./routes/api');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { ONE_WEEK } = require('./constants');

const app = express();

app.use(cookieParser());

app.use(
  cookieSession({
    name: 'session',
    maxAge: ONE_WEEK,
    keys: [process.env.COOKIE_KEY, process.env.COOKIE_KEY_ROTATE],
  }),
);

app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }

  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', api);

app.use(errorMiddleware);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
