import express from 'express';
import passport from '../utils/passport.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

export const oauthRouter = express.Router();

const TTL = 30 * 24 * 60 * 60 * 1000;

oauthRouter.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

oauthRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_HOST}/login`,
  }),
  async (req, res) => {
    const normalizedUser = userService.normalize(req.user);
    const accessToken = jwtService.sign(normalizedUser);
    const refreshToken = jwtService.signRefresh(normalizedUser);

    await tokenService.save(normalizedUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      maxAge: TTL,
      httpOnly: true,
    });

    res.redirect(
      `${process.env.CLIENT_HOST}/oauth?accessToken=${accessToken}&user=${encodeURIComponent(JSON.stringify(normalizedUser))}`,
    );
  },
);

oauthRouter.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'], session: false }),
);

oauthRouter.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_HOST}/login`,
  }),
  async (req, res) => {
    const normalizedUser = userService.normalize(req.user);
    const accessToken = jwtService.sign(normalizedUser);
    const refreshToken = jwtService.signRefresh(normalizedUser);

    const baseURL = new URL(`${process.env.CLIENT_HOST}/oauth`);

    baseURL.searchParams.set('accessToken', accessToken);
    baseURL.searchParams.set('user', JSON.stringify(normalizedUser));

    const accessTokenURL = baseURL.toString();

    await tokenService.save(normalizedUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.redirect(accessTokenURL);
  },
);
