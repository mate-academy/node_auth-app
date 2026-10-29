import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';
import * as validation from '../utils/validators.js';
import { sendActivationEmail, sendResetEmail } from '../utils/mailer.js';
// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import * as refreshService from '../services/refreshToken.service.js';
import * as resetService from '../services/resetToken.service.js';

export const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : email;

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const normalizedEmail = normalizeEmail(email);

  try {
    const errors = {
      name: validation.validateName(name),
      email: validation.validateEmail(normalizedEmail),
      password: validation.validatePassword(password),
    };

    if (Object.values(errors).some((error) => typeof error === 'string')) {
      res.status(400).json({ message: 'Validation failed', errors });

      return;
    }

    if (await userService.getByEmail(normalizedEmail)) {
      res.status(409).json({ message: 'User with this email already exists' });

      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(48).toString('hex');

    const user = await userService.create({
      name,
      email: normalizedEmail,
      passwordHash,
      activationToken,
    });

    await sendActivationEmail(user.email, activationToken);

    res.status(201).json({
      message: 'Check your email to activate the account',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'User with this email already exists' });

      return;
    }

    throw error;
  }
};

export const activate = async (req, res) => {
  try {
    const { activationToken } = req.params;

    const user = await userService.getByActivationToken(activationToken);

    if (!user) {
      return res.redirect(`${process.env.FRONT_URL}/activation?status=error`);
    }

    user.activationToken = null;
    user.isActive = true;
    await user.save();

    await setCookie(user, res);

    return res.redirect(`${process.env.FRONT_URL}/activation?status=success`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Activation error:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  try {
    const user = await userService.getByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Please activate your email before logging in',
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const generateAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    const RefreshToken = await refreshService.verifyRefreshToken(token);

    if (RefreshToken === null) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    const accessToken = await refreshService.generateAccessToken(
      RefreshToken.userId,
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Load profile error:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const loadProfile = async (req, res) => {
  try {
    const user = await userService.getById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User profile not found',
      });
    }

    const { name, email } = user;

    return res.json({ name, email });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Load profile error:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const setCookie = async (user, res) => {
  const refreshToken = await refreshService.generateRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: refreshService.REFRESH_TTL_MS,
    path: '/auth',
  });
};

export const clearCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth',
  });
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await refreshService.removeRefreshToken(refreshToken);
    }

    clearCookie(res);
    res.sendStatus(204);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout error:', error);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = normalizeEmail(email);
    const validaterAnswer = validation.validateEmail(normalizedEmail);

    if (validaterAnswer) {
      // Send message error
      res.status(400).json({ message: validaterAnswer });

      return;
    }

    const user = await userService.getByEmail(normalizedEmail);

    if (user) {
      if (user.isActive === false) {
        let activationToken = user.activationToken;

        if (!activationToken) {
          activationToken = crypto.randomBytes(48).toString('hex');

          await userService.update(user.id, { activationToken });
        }
        await sendActivationEmail(user.email, activationToken);
      } else {
        const token = await resetService.generateResetToken(user.id);

        await sendResetEmail(user.email, token);
      }
    }

    res.json({
      message: 'If an account with this email exists, we sent you an email',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset error:', error);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const resetPassword = async (req, res) => {};

// guest-middleware + remove catch error(use midleware)
