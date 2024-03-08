'use strict';

require('dotenv/config');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const { ErrorApi } = require('../exceptions/ErrorApi');
const { userService } = require('../services/userService.js');
const { User } = require('../models/User');

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_DOMAIN}/auth/google/callback`,
    scope: ['profile', 'email'],
  },
  async(accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const googleEmail = emails[0].value;

    if (!id || !displayName || !emails || !googleEmail) {
      throw ErrorApi.BadRequest('Google has given bad data');
    }

    let foundUser = await userService.getByGoogleId(id);

    if (foundUser) {
      foundUser.name = displayName;
      foundUser.email = googleEmail;
      await foundUser.save();
    } else {
      foundUser = await User.create({
        googleId: id,
        name: displayName,
        email: googleEmail,
      });
    }

    done(null, foundUser);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = { googlePassport: passport };
