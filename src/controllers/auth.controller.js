import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';
import * as validation from '../utils/validators.js';
import {
  sendActivationEmail,
  sendResetEmail,
  sendChangeEmail,
  sendWarningEmail,
} from '../utils/mailer.js';
// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import * as refreshService from '../services/refreshToken.service.js';
import * as resetService from '../services/resetToken.service.js';
import * as changeService from '../services/changeToken.service.js';

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
    user: { name: user.name, email: user.email, isActive: user.isActive },
    accessToken,
  });
};

export const loadProfile = async (req, res) => {
  const user = await userService.getById(req.user.id);

  if (!user) {
    return res.status(401).json({
      message: 'User profile not found',
    });
  }

  const { name, email, isActive } = user;

  return res.json({
    message: 'Success',
    user: {
      name,
      email,
      isActive,
    },
  });
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
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await refreshService.removeRefreshToken(refreshToken);
  }

  clearCookie(res);
  res.sendStatus(204);
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = normalizeEmail(email);
  const validaterAnswer = validation.validateEmail(normalizedEmail);

  if (validaterAnswer) {
    res.status(400).json({ message: validaterAnswer });

    return;
  }

  const user = await userService.getByEmail(normalizedEmail);

  if (user) {
    if (user.isActive === false) {
      let activationToken = user.activationToken;

      if (!activationToken) {
        activationToken = crypto.randomBytes(48).toString('hex');

        await userService.update(user.i00d, { activationToken });
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
};

const checkPasswordMatch = (password, confirmation) => {
  const validatorMessage = validation.validatePassword(password);

  if (validatorMessage) {
    return validatorMessage;
  }

  if (confirmation !== password) {
    return 'Passwords do not match';
  }

  return null;
};

export const resetPassword = async (req, res) => {
  const { password, confirmation, token } = req.body ?? {};

  if (typeof token !== 'string') {
    return res.status(400).json({
      message: 'Invalid token type',
    });
  }

  const checkPassword = checkPasswordMatch(password, confirmation);

  if (typeof checkPassword === 'string') {
    return res.status(400).json({
      message: checkPassword,
    });
  }

  const userId = await resetService.consumeResetToken(token);

  if (userId === null) {
    return res
      .status(404)
      .json({ message: 'Token is invalid or already used' });
  }

  const newPassword = await bcrypt.hash(password, 10);

  await userService.update(userId, {
    passwordHash: newPassword,
  });
  await refreshService.removeAllUserTokens(userId);

  res.status(200).json({ message: 'Password has been reset' });
};

export const changePassword = async (req, res) => {
  const { currentPassword, password, confirmation } = req.body ?? {};

  if (typeof currentPassword !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of current password',
    });
  }

  const checkPassword = checkPasswordMatch(password, confirmation);

  if (checkPassword !== null) {
    return res.status(400).json({
      message: checkPassword,
    });
  }

  const user = await userService.getById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isMatch) {
    return res.status(400).json({
      message: 'Oppsss... Current password is not valid, try again',
    });
  }

  const isSamePassword = await bcrypt.compare(password, user.passwordHash);

  if (isSamePassword) {
    return res.status(400).json({
      message: 'New password must differ from the current one',
    });
  }

  const newPassword = await bcrypt.hash(password, 10);

  await userService.update(user.id, {
    passwordHash: newPassword,
  });

  res.status(200).json({ message: 'Password has been changed' });
};

export const changeEmail = async (req, res) => {
  const { currentPassword, newEmail, confirmEmail } = req.body || {};

  if (typeof currentPassword !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of password',
    });
  }

  if (typeof newEmail !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of email',
    });
  }

  if (typeof confirmEmail !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of email',
    });
  }

  const normalizedNewEmail = normalizeEmail(newEmail);
  const normalizedConfirmEmail = normalizeEmail(confirmEmail);

  const newEmailError = validation.validateEmail(normalizedNewEmail);

  if (newEmailError) {
    return res.status(400).json({
      message: newEmailError,
    });
  }

  if (normalizedNewEmail !== normalizedConfirmEmail) {
    return res.status(400).json({
      message: 'Emails do not match',
    });
  }

  const user = await userService.getById(req.user.id);

  if (!user) {
    return res.status(401).json({
      message: 'User profile not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    return res.status(400).json({
      message: 'Invalid password',
    });
  }

  if (normalizedNewEmail === user.email) {
    return res.status(409).json({
      message: 'The new email cannot be identical to the current one',
    });
  }

  const existingUser = await userService.getByEmail(normalizedNewEmail);

  if (existingUser) {
    return res.status(409).json({
      message: 'User with this email already exists',
    });
  }

  const token = await changeService.generateChangeToken(
    user.id,
    normalizedNewEmail,
  );

  await sendChangeEmail(normalizedNewEmail, token);
  await sendWarningEmail(user.email, normalizedNewEmail);

  return res.status(200).json({
    message: 'Confirmation link sent to the new email',
  });
};

export const confirmEmailChange = async (req, res) => {
  const { changeToken } = req.params;
  const record = await changeService.consumeChangeToken(changeToken);

  if (!record) {
    return res.redirect(`${process.env.FRONT_URL}/profile?emailChange=invalid`);
  }

  const taken = await userService.getByEmail(record.newEmail);

  if (taken) {
    return res.redirect(`${process.env.FRONT_URL}/profile?emailChange=taken`);
  }

  await userService.update(record.userId, { email: record.newEmail });

  res.redirect(`${process.env.FRONT_URL}/profile?emailChange=success`);
};
