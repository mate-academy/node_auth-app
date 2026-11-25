/* eslint-disable no-console */
'use strict';

const express = require('express');
const session = require('express-session');
const { rateLimit } = require('express-rate-limit');
const { join } = require('node:path');

const { root, port, baseUrl, SESSION_SECRET } = require('./config');

const { byId } = require('./db');
const { randomToken } = require('./security');
const { flushMail } = require('./mail');
const { page, loginLink } = require('./pages');

const authRoutes = require('./routes/auth/index.js');
const profileRoutes = require('./routes/profile/index.js');

const app = express();

app.disable('x-powered-by');

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', join(root, 'views'));

app.use(
  express.urlencoded({
    extended: false,
    limit: '10kb',
  }),
);

app.use(
  session({
    name: 'auth.sid',
    secret: SESSION_SECRET || randomToken(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: baseUrl.protocol === 'https:',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

const limitPosts = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
});

app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  });

  if (req.method === 'POST') {
    return limitPosts(req, res, next);
  }

  next();
});

app.use((req, res, next) => {
  const user = req.session.userId ? byId.get(req.session.userId) : null;

  req.user = user?.active && user.version === req.session.version ? user : null;

  next();
});

app.use(authRoutes);
app.use(profileRoutes);

app.use((req, res) => {
  return page(req, res, 'Page not found', {
    status: 404,
    links: [loginLink],
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status >= 400 && error.status < 500 ? error.status : 500;

  if (status === 500) {
    console.error(error);
  }

  return page(req, res, status === 500 ? 'Server error' : 'Invalid request', {
    status,
  });
});

app.listen(port, process.env.HOST || '127.0.0.1', (error) => {
  if (error) {
    throw error;
  }

  console.log('Server is running on ' + baseUrl.origin);

  flushMail();

  setInterval(flushMail, 30_000).unref();
});
