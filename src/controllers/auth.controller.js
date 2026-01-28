import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const authController = {
  async register(req, res, next) {
    try {
      await authService.register(req.body);

      res
        .status(201)
        .json({ message: 'Registration successful. Check your email.' });
    } catch (err) {
      next(err);
    }
  },

  async activate(req, res, next) {
    try {
      const { token } = req.query;
      const { token: jwtToken, user } = await authService.activate(token);

      setAuthCookie(res, jwtToken);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { token, user } = await authService.login(req.body);

      setAuthCookie(res, token);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
  },

  async resetRequest(req, res, next) {
    try {
      await authService.resetPasswordRequest(req.body.email);
      res.status(200).json({ message: 'Email sent' });
    } catch (err) {
      next(err);
    }
  },

  async resetConfirm(req, res, next) {
    try {
      const { token } = req.query;

      await authService.resetPasswordConfirm(token, req.body);
      res.status(200).json({ message: 'Password updated' });
    } catch (err) {
      next(err);
    }
  },
};
