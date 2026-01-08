'use strict';

const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(
    cookieSession({
      name: 'session',
      // eslint-disable-next-line max-len
      keys: ['secret-key-1', 'secret-key-2'], // Replace with env variables in production
      maxAge: 24 * 60 * 60 * 1000,
    }),
  );

  app.use(authRoutes.router);

  app.get('/', (req, res) => {
    res.redirect('/register');
  });

  app.use((req, res) => {
    res.status(404).send(`
      <h1>404 - Page Not Found</h1>
      <p>Oops! We couldn't find that page.</p>
      <a href="/">Go Home</a>
      `);
  });

  return app;
}

module.exports = { createServer };
