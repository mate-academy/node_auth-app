import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { usersRepository } from '../entity/users.repository';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

        const user = await usersRepository.findOrCreateOAuthUser({
          email,
          name: profile.displayName,
          googleId: profile.id,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
