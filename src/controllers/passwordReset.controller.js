import { ApiError } from '../exeptions/api.error.js';
import { Token } from '../models/token.js';
import { User } from '../models/user.js';
import { passwordResetService } from '../service/passwordReset.service.js';
import { Validate } from '../utils/validate.js';
import bcrypt from 'bcrypt';

const reset = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: Validate.email(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad Request', {
      errors,
    });
  }

  await passwordResetService.reset(email);

  res.status(200).json({
    message: 'Reset link sent successfully',
  });
};

const activate = async (req, res) => {
  const { resetToken } = req.params;

  const user = await User.findOne({
    where: {
      resetToken,
    },
  });

  if (!user) {
    throw ApiError.notFound('Not found user');
  }

  if (Date.now() > user.resetTokenExpiry) {
    throw ApiError.badRequest('Token expired');
  }

  return res.redirect(`/reset-password/confirm?token=${resetToken}`);
};

const createNewPassword = async (req, res) => {
  const { token } = req.query;
  const { password, confirmation } = req.body;

  const user = await User.findOne({
    where: {
      resetToken: token,
    },
  });

  if (!user) {
    throw ApiError.notFound('Not found user');
  }

  const refreshToken = await Token.findOne({
    where: { userId: user.id },
  });

  if (refreshToken) {
    throw ApiError.badRequest('You need to logout');
  }

  if (Date.now() > user.resetTokenExpiry) {
    throw ApiError.badRequest('Token expired');
  }

  const errors = {
    password: Validate.password(password),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad Request', {
      errors,
    });
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Bad Request');
  }

  const isSamePassword = await bcrypt.compare(password, user.password);

  if (isSamePassword) {
    throw ApiError.badRequest(
      'New password must be different from old password',
    );
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.send({ message: 'ok' });
};

export const passwordResetController = {
  reset,
  activate,
  createNewPassword,
};
