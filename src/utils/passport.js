import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { userService } from '../services/user.service.js';

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
        const name = profile.displayName;

        let user = await userService.findByEmail(email);

        if (!user) {
          user = await userService.registerOAuth(name, email);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.username;

        if (!email) {
          return done(new Error('No email provided from GitHub'));
        }

        let user = await userService.findByEmail(email);

        if (!user) {
          user = await userService.registerOAuth(name, email);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

export default passport;
