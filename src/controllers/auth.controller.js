import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { Op } from 'sequelize';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);

  res.send({
    message:
      'Registration successful, check your email to activate your account',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  res.redirect('/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  if (!user.isActive) {
    throw ApiError.Unauthorized('Please activate your account via email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.Unauthorized();
  }

  await tokenService.remove(userData.id);

  res.status(200).send({
    message: 'Logout successful',
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  user.resetTokenExpiresAt = Date.now() + 3600000; // 1 година

  await user.save();

  await emailService.sendResetPasswordMail(email, resetToken);

  res.send({ message: 'Reset link sent to your email' });
};

const checkResetToken = async (req, res) => {
  const { resetToken } = req.params;
  const user = await User.findOne({
    where: {
      resetToken,
      resetTokenExpiresAt: {
        [Op.gt]: Date.now(),
      },
    },
  });

  if (!user) {
    throw ApiError.BadRequest('Invalid or expired reset token');
  }
  /* user.resetToken = null;
  user.resetTokenExpiry = null;

  await user.save();
  */
  res.status(200).send({ message: 'Token is valid' });
};

const ConfirmResetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    where: {
      resetToken,
      resetTokenExpiresAt: {
        [Op.gt]: Date.now(),
      },
    },
  });

  if (!user) {
    throw ApiError.BadRequest('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiresAt = null;

  await user.save();

  res.send(userService.normalize(user));
};

export const authController = {
  activate,
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  checkResetToken,
  ConfirmResetPassword,
};
