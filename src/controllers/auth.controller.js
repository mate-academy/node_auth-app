import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';
import * as validation from '../utils/validators.js';
import { sendActivationEmail } from '../utils/mailer.js';
import { setCookie, clearCookie } from '../utils/cookies.js';
// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import * as refreshService from '../services/refreshToken.service.js';
import { normalizeEmail } from '../utils/normalizeEmail';
import { toPublicUser } from '../utils/publicUser.js';

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
      user: toPublicUser(user),
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
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of email',
    });
  }

  if (typeof password !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of password',
    });
  }

  const normalizedEmail = normalizeEmail(email);
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

  await setCookie(user, res);

  const accessToken = await refreshService.generateAccessToken(user.id);

  res.status(200).json({
    message: 'Success',
    user: toPublicUser(user),
    accessToken,
  });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await refreshService.removeRefreshToken(refreshToken);
  }

  clearCookie(res);
  res.sendStatus(204);
};
