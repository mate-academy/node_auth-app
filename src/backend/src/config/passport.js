'use strict';

const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');

function isGithubAuthEnabled() {
  return Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  );
}

if (isGithubAuthEnabled()) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        scope: ['user:email'],
        callbackURL:
          process.env.GITHUB_CALLBACK_URL ||
          `${process.env.SERVER_URL || 'http://localhost:4000'}/auth/github/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        const emails = Array.isArray(profile.emails)
          ? profile.emails.map((email) => email.value).filter(Boolean)
          : [];

        if (profile._json?.email) {
          emails.push(profile._json.email);
        }

        done(null, {
          providerUserId: String(profile.id),
          username: profile.username || '',
          displayName: profile.displayName || '',
          emails: [...new Set(emails)],
        });
      },
    ),
  );
}

module.exports = {
  passport,
  isGithubAuthEnabled,
};
