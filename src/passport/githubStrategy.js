import { Strategy as GithubStrategy } from 'passport-github2';

import { socialAccountService } from '../services/socialAccount.servise.js';

export const githubStrategy = new GithubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await socialAccountService.githubLogin(profile, accessToken);

      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);
