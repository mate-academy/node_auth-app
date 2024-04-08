/* eslint-disable max-len */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

passport.use(
  new GoogleStrategy({
    clientID:
      '1024293111155-7fv12cb0d0i1setnh4len51frq0h0j2i.apps.googleusercontent.com',
    clientSecret: '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',
  }),
  () => {
    // callback
  },
);
