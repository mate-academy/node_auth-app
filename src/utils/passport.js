'use strict';

const passport = require('passport');
const { Account } = require('../models/Account');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models/User');

require('dotenv').config();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/auth/google/callback',
    scope: ['email', 'profile'],
  },

  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ where: { id: profile.id } });

      if (user) {
        cb(null, user);
      } else {
        const account = await Account.findOne({ where: { id: profile.id } });

        if (account) {
          user = await User.findOne({ where: { id: account.userId } });
        } else {
          user = await User.create({
            id: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            authType: 'google',
          });

          await Account.create({
            userId: user.id,
            id: profile.id,
            name: profile.displayName,
            type: 'google',
          });
        }

        cb(null, user);
      }
    } catch (err) {
      cb(err);
    }
  }
));

passport.use('connectGoogle', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/connect/google/callback',
    scope: ['profile'],
  },

  async function(accessToken, refreshToken, profile, cb) {
    try {
      const account = {
        id: profile.id,
        name: profile.displayName,
        type: 'google',
      };

      cb(null, account);
    } catch (err) {
      cb(err);
    }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/auth/github/callback',
    scope: ['user:email', 'read:user'],
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ where: { id: profile.id } });

      if (user) {
        cb(null, user);
      } else {
        const account = await Account.findOne({ where: { id: profile.id } });

        if (account) {
          user = await User.findOne({ where: { id: account.userId } });
          cb(null, user);
        } else {
          user = await User.create({
            id: profile.id,
            username: profile.username,
            email: profile.emails[0].value,
            authType: 'github',
          });

          await Account.create({
            userId: user.id,
            id: profile.id,
            name: profile.username,
            type: 'github',
          });

          cb(null, user);
        }
      }
    } catch (err) {
      cb(err);
    }
  }
));

passport.use('connectGithub', new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/auth/github/callback/connect',
    scope: ['read:user'],
  },

  async function(accessToken, refreshToken, profile, cb) {
    try {
      const account = {
        id: profile.id,
        name: profile.username,
        type: 'github',
      };

      cb(null, account);
    } catch (err) {
      cb(err);
    }
  }
));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((userId, cb) => {
  User.findByPk(userId)
    .then((user) => {
      cb(null, user);
    })
    .catch(error => cb(error));
});
