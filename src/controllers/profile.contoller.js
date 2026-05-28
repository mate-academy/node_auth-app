import { ApiError } from '../exeptions/api.error.js';
import { profileService } from '../service/profile.service.js';
import bcrypt from 'bcrypt';
import { Validate } from '../utils/validate.js';

const updateName = async (req, res) => {
  const { name } = req.user;
  const { name: newName } = req.body;

  const errors = {
    name: Validate.name(newName),
  };

  if (errors.name) {
    throw ApiError.badRequest('Bad Request', {
      errors,
    });
  }

  if (name === newName) {
    throw ApiError.badRequest(
      'The new name must be different from the old one.',
    );
  }

  await req.user.update({ name: newName });

  res.send({ message: 'Name changed successfully' });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  const isOldPasswordCorrect = await bcrypt.compare(
    oldPassword,
    req.user.password,
  );

  if (!isOldPasswordCorrect) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  const errors = {
    password: Validate.password(newPassword),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad Request', {
      errors,
    });
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match.');
  }

  const isSamePassword = await bcrypt.compare(newPassword, req.user.password);

  if (isSamePassword) {
    throw ApiError.badRequest(
      'New password must be different from old password',
    );
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  await req.user.update({ password: hashedPass });

  res.send({ message: 'Password updated' });
};

const updateEmail = async (req, res) => {
  const email = req.user.email;
  const { password, email: newEmail } = req.body;

  const errors = {
    email: Validate.email(newEmail),
    password: Validate.password(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad Request', { errors });
  }

  const isSamePassword = await bcrypt.compare(password, req.user.password);

  if (!isSamePassword) {
    throw ApiError.badRequest('Your password is wrong');
  }

  if (email === newEmail) {
    throw ApiError.badRequest(
      'The new Email must be different from the old one.',
    );
  }

  await profileService.updateEmail(email, newEmail);

  res.json({ message: 'Confirmation sent to new email' });
};

const confirmEmailChange = async (req, res) => {
  const { emailChangeToken } = req.params;

  await profileService.confirmEmailChange(emailChangeToken);

  res.json({ message: 'Email changed successfully' });
};

export const profileController = {
  updateName,
  updatePassword,
  updateEmail,
  confirmEmailChange,
};
