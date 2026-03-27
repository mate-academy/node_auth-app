import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { userService } from '../services/user.service.js';
import { socialAccountService } from '../services/social-account.service.js';

const SERVER_HOST =
  process.env.SERVER_HOST || `http://localhost:${process.env.PORT || 3005}`;

const handleSocialAuth = (provider) => {
  return async (req, accessToken, refreshToken, profile, done) => {
    try {
      const providerId = profile.id;
      const email = profile.emails?.[0]?.value;
      const displayName = profile.displayName || email?.split('@')[0] || 'User';
      const linkUserId = req.session?.linkUserId;

      if (linkUserId) {
        delete req.session.linkUserId;

        const linkedAccount = await socialAccountService.getByProviderAndId(
          provider,
          providerId,
        );

        if (linkedAccount) {
          if (linkedAccount.userId === linkUserId) {
            return done(null, await userService.getById(linkUserId));
          }

          return done(null, false, {
            message: 'This account is already linked to another user',
          });
        }

        await socialAccountService.create(linkUserId, provider, providerId);

        return done(null, await userService.getById(linkUserId));
      }

      const existing = await socialAccountService.getByProviderAndId(
        provider,
        providerId,
      );

      if (existing) {
        return done(null, await userService.getById(existing.userId));
      }

      let user = email ? await userService.getByEmail(email) : null;

      if (!user) {
        if (!email) {
          return done(null, false, {
            message: 'Email is required for registration',
          });
        }

        user = await userService.createSocialUser(displayName, email);
      } else if (user.activationToken) {
        user = await userService.clearActivation(user.id);
      }

      await socialAccountService.create(user.id, provider, providerId);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };
};

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_HOST}/auth/google/callback`,
        passReqToCallback: true,
      },
      handleSocialAuth('google'),
    ),
  );
}

if (process.env.FACEBOOK_APP_ID) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${SERVER_HOST}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'email'],
        passReqToCallback: true,
      },
      handleSocialAuth('facebook'),
    ),
  );
}

if (process.env.GITHUB_CLIENT_ID) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${SERVER_HOST}/auth/github/callback`,
        passReqToCallback: true,
        scope: ['user:email'],
      },
      handleSocialAuth('github'),
    ),
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getById(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
