import bcrypt from 'bcrypt';
import { checkPasswordMatch } from '../utils/checkPasswordMatch.js';
import * as validation from '../utils/validators.js';
import * as userService from '../services/user.service.js';
import { sendChangeEmail, sendWarningEmail } from '../utils/mailer.js';
import { normalizeEmail } from '../utils/normalizeEmail';
import * as changeService from '../services/changeToken.service.js';
import { toPublicUser } from '../utils/publicUser.js';

export const loadProfile = async (req, res) => {
  const user = await userService.getById(req.user.id);

  if (!user) {
    return res.status(401).json({
      message: 'User profile not found',
    });
  }

  return res.json({
    message: 'Success',
    user: toPublicUser(user),
  });
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

export const changeName = async (req, res) => {
  const { name } = req.body || {};

  if (typeof name !== 'string') {
    return res.status(400).json({
      message: 'Invalid type of name',
    });
  }

  const normalizedName = name.trim();
  const user = await userService.getById(req.user.id);

  if (!user) {
    return res.status(401).json({
      message: 'User not found',
    });
  }

  const validMessage = validation.validateName(normalizedName);

  if (validMessage) {
    return res.status(400).json({
      message: validMessage,
    });
  }

  const updatedUser = await userService.update(req.user.id, {
    name: normalizedName,
  });

  return res.status(200).json({
    message: 'The name was successfully changed!',
    user: toPublicUser(updatedUser),
  });
};
