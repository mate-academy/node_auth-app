import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';
import passport from '../utils/passport.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  await authService.register(name, email, password);

  res.send({ message: 'Registration successful' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const activatedUser = await authService.activate(activationToken);

  res.send(userService.normalize(activatedUser));
};

const sendAuthentication = async (res, user) => {
  const {
    user: normalizedUser,
    accessToken,
    refreshToken,
  } = await authService.authenticate(user);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.send({ user: normalizedUser, accessToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.login(email, password);

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await authService.refresh(refreshToken);

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');

  res.send({ message: 'Logged out successfully' });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  await authService.requestPasswordReset(email);

  res.clearCookie('refreshToken');
  res.send({ message: 'Password reset email sent' });
};

const confirmPasswordReset = async (req, res) => {
  const { passwordResetToken } = req.params;
  const { password } = req.body;

  await authService.confirmPasswordReset(passwordResetToken, password);

  res.clearCookie('refreshToken');
  res.send({ message: 'Password reset successful' });
};

const confirmEmailChange = async (req, res) => {
  const { pendingEmailToken } = req.params;

  await authService.confirmEmailChange(pendingEmailToken);

  res.clearCookie('refreshToken');
  res.send({ message: 'Email updated successfully' });
};

const socialCallback = (provider) => (req, res, next) => {
  passport.authenticate(
    provider,
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(err);
      }

      const isLink = req.session?.socialAuthIntent === 'link';

      if (req.session?.socialAuthIntent) {
        delete req.session.socialAuthIntent;
      }

      if (!user) {
        const errorMsg = encodeURIComponent(
          info?.message || 'Authentication failed',
        );
        const redirectPath = isLink ? '/profile' : '/login';

        return res.redirect(
          `${process.env.CLIENT_HOST}${redirectPath}?error=${errorMsg}`,
        );
      }

      if (isLink) {
        return res.redirect(
          `${process.env.CLIENT_HOST}/profile?linked=${provider}`,
        );
      }

      const code = uuidv4();

      req.session.authCode = code;
      req.session.authUserId = user.id;

      req.session.save((saveErr) => {
        if (saveErr) {
          return next(saveErr);
        }

        res.redirect(`${process.env.CLIENT_HOST}/auth/callback?code=${code}`);
      });
    },
  )(req, res, next);
};

const exchangeCode = async (req, res) => {
  const { code } = req.body;

  if (!code || !req.session?.authCode || req.session.authCode !== code) {
    throw ApiError.badRequest('Invalid or expired authorization code');
  }

  const userId = req.session.authUserId;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Failed to destroy session after code exchange', {
        message: err.message,
      });
    }
  });

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  await sendAuthentication(res, user);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  confirmEmailChange,
  socialCallback,
  exchangeCode,
};
