import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';

async function findOrCreateOAuthUser({ email, name }) {
  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      email,
      name,
      password: null,
      activationToken: null,
    });
  }

  return user;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            ApiError.badRequest('Google account does not have an email'),
          );
        }

        const user = await findOrCreateOAuthUser({
          email,
          name: profile.displayName || profile.username,
        });

        return done(null, user);
      } catch (error) {
        if (error instanceof ApiError) {
          return done(error);
        }
        return done(
          ApiError.internal(
            'An unexpected error occurred during Google authentication',
          ),
        );
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
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value;

        if (!email) {
          return done(
            ApiError.badRequest('GitHub account does not have a public email'),
          );
        }

        const user = await findOrCreateOAuthUser({
          email,
          name: profile.displayName || profile.username,
        });

        return done(null, user);
      } catch (error) {
        return done(
          error instanceof ApiError
            ? error
            : ApiError.internal('GitHub authentication error'),
        );
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            ApiError.badRequest('Facebook account does not have an email'),
          );
        }

        const name =
          profile.displayName ||
          `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`;
        const user = await findOrCreateOAuthUser({ email, name });

        return done(null, user);
      } catch (error) {
        return done(
          error instanceof ApiError
            ? error
            : ApiError.internal('Facebook authentication error'),
        );
      }
    },
  ),
);
