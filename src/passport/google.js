import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { socialAccountService } from '../services/socialAccount.servise.js';

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await socialAccountService.googleLogin(profile);

      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);
