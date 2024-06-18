require('dotenv').config();

const GOOGLE_AUTH_OPTIONS = {
  callbackURL: '/api/users/login/google/callback',
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

module.exports = {
  GOOGLE_AUTH_OPTIONS,
};
