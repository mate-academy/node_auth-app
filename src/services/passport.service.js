/* eslint-disable no-console */
/* eslint-disable max-len */
require('dotenv/config');

const passport = require('passport');
const userService = require('./user.service.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      const user = await userService.findOrCreate(profile, 'googleId');

      done(null, user);
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: '/auth/github/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      const user = await userService.findOrCreate(profile, 'gitHubId');

      done(null, user);
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userService.findById(id).then((user) => {
    done(null, user);
  });
});
