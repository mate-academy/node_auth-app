import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { validators } from '../utils/validators.js';

async function changeName(req, res) {
  const { name } = req.body;

  if (!name || !name?.trim()) {
    throw ApiError.badRequest('Validation error', { name: 'Name is required' });
  }

  const user = await User.findByPk(req.user.id);

  user.name = name.trim();
  await user.save();
  res.send({ user: userService.normalize(user) });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword, confirmation } = req.body;

  const errors = {
    oldPassword: !oldPassword ? 'Old password is required' : undefined,
    confirmation:
      newPassword !== confirmation ? 'Passwords do not match' : undefined,
    newPassword: validators.validatePassword(newPassword),
  };

  if (errors.oldPassword || errors.newPassword || errors.confirmation) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await User.findByPk(req.user.id);

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw ApiError.badRequest('Validation error', {
      oldPassword: 'Wrong password',
    });
  }

  const securedPassword = await bcrypt.hash(newPassword, 10);

  user.password = securedPassword;
  await user.save();

  res.send({ message: 'Password has been changed' });
}

async function changeEmail(req, res) {
  const { password, newEmail, confirmation } = req.body;

  const errors = {
    password: !password ? 'password is required' : undefined,
    confirmation: newEmail !== confirmation ? 'Emails do not match' : undefined,
    newEmail: validators.validateEmail(newEmail),
  };

  if (errors.password || errors.newEmail || errors.confirmation) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await User.findByPk(req.user.id);

  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.badRequest('Validation error', {
      password: 'Wrong password',
    });
  }

  if (newEmail === user.email) {
    throw ApiError.badRequest('Validation error', {
      newEmail: 'This is your current email',
    });
  }

  if (await User.findOne({ where: { email: newEmail } })) {
    throw ApiError.conflict('User with this email already exists');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangedEmail(oldEmail, newEmail);
  res.send({ user: userService.normalize(user) });
}

export const profileController = {
  changeName,
  changePassword,
  changeEmail,
};
