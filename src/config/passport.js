const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AppleStrategy = require('passport-apple');
const userService = require('../services/userService');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findById(id);

    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

async function upsertOAuthUser(profile, provider) {
  const email =
    profile.emails && profile.emails[0] ? profile.emails[0].value : null;

  if (!email) {
    throw new Error(`Email não fornecido pelo provedor ${provider}`);
  }

  let user = await userService.findByEmail(email);

  if (!user) {
    user = await userService.create({
      name: profile.displayName || profile.username || 'Usuário',
      email: email,
      isActive: true, // Confiaremos no provedor OAuth
    });
  } else if (!user.isActive) {
    // Se a conta estava pendente, ativamos agora
    await userService.update(user.id, {
      isActive: true,
      activationToken: null,
    });
    user.isActive = true;
  }

  // Opcional: Atrelar os IDs se estiverem vazios
  if (provider === 'google' && !user.googleId) {
    await userService.update(user.id, { googleId: profile.id });
  }

  if (provider === 'github' && !user.githubId) {
    await userService.update(user.id, { githubId: profile.id });
  }

  return user;
}

// Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertOAuthUser(profile, 'google');

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

// GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
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
          const user = await upsertOAuthUser(profile, 'github');

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

// Apple - Needs Apple Developer details to be loaded into .env
if (
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY,
        callbackURL: '/auth/apple/callback',
      },
      async (req, accessToken, refreshToken, idToken, profile, done) => {
        try {
          const parsedProfile = profile || {};

          if (!parsedProfile.emails && idToken) {
            // Extract email from Apple JWT idToken manually
            const jwtPayload = JSON.parse(
              Buffer.from(idToken.split('.')[1], 'base64').toString(),
            );

            if (jwtPayload.email) {
              parsedProfile.emails = [{ value: jwtPayload.email }];
            }
          }

          const user = await upsertOAuthUser(parsedProfile, 'apple');

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

module.exports = passport;
