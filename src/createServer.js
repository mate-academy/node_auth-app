'use strict';

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const UsersRouter = require('./components/routes/users.routes');
const AuthRouter = require('./components/routes/auth.routes');
const UsersService = require('./components/users/users.service');
// eslint-disable-next-line max-len
const errorMiddleware = require('./components/auth/middlewares/error.middleware');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async(email, password, done) => {
      try {
        const user = await UsersService.getOneByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

function createServer() {
  const app = express();

  app.get('/', (req, res) => {
    res.redirect('/auth/login');
  });

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: Boolean(process.env.RESAVE),
    saveUninitialized: Boolean(process.env.SAVEUNINITIALIZED),
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/users', UsersRouter);
  app.use('/auth', AuthRouter);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createServer };
