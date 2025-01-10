'use strict';

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await UsersService.getOneByEmail(email);

        if (!user) {
          user = await UsersService.save(email, null, null);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UsersService.getOne(id);

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

function createServer() {
  const app = express();

  app.get('/', (req, res) => {
    res.redirect('/auth/login');
  });

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: Boolean(process.env.RESAVE),
      saveUninitialized: Boolean(process.env.SAVEUNINITIALIZED),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/users', UsersRouter);
  app.use('/auth', AuthRouter);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createServer };
