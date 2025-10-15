import { User } from '../models/User.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
// import { Token } from '../models/Token.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(value)) {
    return 'Email is invalid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required!';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }
}

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    throw ApiError.badRequest(
      'Name is required and should be at least 2 characters',
    );
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Invalid email or password', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register({ name, email, password: hashedPass });

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user exists');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Please activate your email before logging in');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.notAuthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.notAuthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(200);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);

  if (!user) {
    return res.send({
      message:
        'If the email exists, password reset instructions have been sent',
    });
  }

  const resetToken = uuidv4();

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  await emailService.sendPasswordResetEmail(email, resetToken);

  res.send({ message: 'Check your email for reset instructions' });
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 14 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Password should have at least 6 characters');
  }

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Reset token invalid or expired');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.send({ message: 'Password reset successful' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
