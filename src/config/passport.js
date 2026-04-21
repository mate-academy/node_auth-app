const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

require('dotenv/config');

const verifyCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  return done(null, profile);
};

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email'],
        passReqToCallback: true,
      },
      verifyCallback,
    ),
  );
}

if (process.env.FACEBOOK_APP_ID) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'email'],
        passReqToCallback: true,
      },
      verifyCallback,
    ),
  );
}

if (process.env.GH_CLIENT_ID) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GH_CLIENT_ID,
        clientSecret: process.env.GH_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
        scope: ['user:email'],
        passReqToCallback: true,
      },
      verifyCallback,
    ),
  );
}

module.exports = passport;
