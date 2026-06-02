import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/api.error.js';
import { emailService } from '../services/email.service.js';

const getProfile = async (req, res) => {
  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  res.send({
    user: userService.normalize(user),
  });
};

const updateProfile = async (req, res) => {
  const {
    name,
    email,
    password,
    emailConfirmation,
    confirmationPassword,
    oldPassword,
  } = req.body;

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.BadRequest('Incorrect old password');
  }

  if (email && email !== user.email) {
    const oldEmail = user.email;

    if (email !== emailConfirmation) {
      throw ApiError.BadRequest('Email confirmation does not match');
    }

    user.email = email;

    await emailService.send(
      oldEmail,
      'Security Alert',
      'Your email has been changed.',
    );
  }

  if (password) {
    if (password.length < 6) {
      throw ApiError.BadRequest('Password must be at least 6 characters');
    }

    if (password !== confirmationPassword) {
      throw ApiError.BadRequest('Passwords do not match');
    }
    user.password = await bcrypt.hash(password, 10);
  }

  user.name = name || user.name;

  await user.save();

  res.send(userService.normalize(user));
};

export const userController = {
  getProfile,
  updateProfile,
};
