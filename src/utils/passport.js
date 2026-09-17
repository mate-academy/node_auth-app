'use strict';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../model/user.model');
const userService = require('../service/user.service');

require('dotenv').config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;

const SERVER_URL = process.env.SERVER_URL;

async function findOrCreateOAuthUser(providerField, providerId, email, name) {
  let user = await userService.findUserByParam({
    where: { [providerField]: providerId },
  });

  if (user) {
    return user;
  }

  if (email) {
    user = await userService.findUserByParam({ where: { email } });

    if (user) {
      return user.update({ [providerField]: providerId });
    }
  }

  return User.create({
    [providerField]: providerId,
    email: email || null,
    name,
  });
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName;
        const email = profile.emails[0].value;

        const user = await findOrCreateOAuthUser(
          'googleId',
          googleId,
          email,
          name,
        );

        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;
        const name = profile.username;
        const email = profile.emails?.[0]?.value;

        const user = await findOrCreateOAuthUser(
          'githubId',
          githubId,
          email,
          name,
        );

        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const facebookId = profile.id;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value;

        const user = await findOrCreateOAuthUser(
          'facebookId',
          facebookId,
          email,
          name,
        );

        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

module.exports = passport;
