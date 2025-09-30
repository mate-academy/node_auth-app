import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// Commented out since they're not being used yet
// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if we have an email
        if (!profile.emails || !profile.emails[0]) {
          return done(new Error('No email associated with this account'));
        }

        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email,
            password: 'google-auth', // Temporary password
            active: true,
            socialAccounts: [
              {
                provider: 'google',
                providerId: profile.id,
              },
            ],
          });
        } else {
          // Check if Google account is already linked
          const isLinked = user.socialAccounts.some(
            (acc) => acc.provider === 'google' && acc.providerId === profile.id,
          );

          if (!isLinked) {
            user.socialAccounts.push({
              provider: 'google',
              providerId: profile.id,
            });
            await user.save();
          }
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

// Uncomment and implement when ready
/*
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName'],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Implementation similar to Google
    }
  )
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
      // Implementation similar to Google
    }
  )
);
*/

export default passport;
