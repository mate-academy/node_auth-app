const { User } = require('../models/user.js');
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const ApiError = require('../exeptions/api.error');
const bcrypt = require('bcrypt');
const tokenService = require('../services/token.service.js');
const sendResetEmail = require('../services/resetEmail.services.js');
const sendConfirmationEmail = require('../services/sendConfirmationEmail.js');
// const { user } = require("../../src copy/models/user");

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

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email) || null,
    password: validatePassword(password) || null,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

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

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid email or password');
  }

  await generateToken(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateToken(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const passwordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('User with that email does not exist');
  }

  const resetToken = jwtService.sign(userService.normalize(user));

  await tokenService.save(user.id, resetToken);
  await sendResetEmail.sendResetEmail(user.email, resetToken);

  res.send({ message: 'Password reset link sent to your email' });
};

const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const user = await User.findByPk(userData.id);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;

  await user.save();

  res.send({ message: 'Password successfully reset' });
};

const updateProfile = async (req, res) => {
  const {
    name,
    oldPassword,
    newPassword,
    confirmPassword,
    newEmail,
    confirmEmail,
  } = req.body;
  const userId = req.user.id;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (name) {
    if (name.trim().length < 2) {
      throw ApiError.badRequest('Name should be at least 2 characters long');
    }

    user.name = name.trim();
  }

  if (newPassword) {
    if (!oldPassword) {
      throw ApiError.badRequest('Old password is required');
    }

    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest('New password and confirmation do not match');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      throw ApiError.badRequest('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
  }

  if (newEmail) {
    if (newEmail !== confirmEmail) {
      throw ApiError.badRequest('New email and confirmation do not match');
    }

    if (!oldPassword) {
      throw ApiError.badRequest('Old password is required for email change');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      throw ApiError.badRequest('Invalid old password for email change');
    }

    const emailError = validateEmail(newEmail);

    if (emailError) {
      throw ApiError.badRequest('Invalid email', { email: emailError });
    }

    const existingUser = await userService.findByEmail(newEmail);

    if (existingUser) {
      throw ApiError.badRequest('Email already in use');
    }

    const oldEmail = user.email;

    await sendConfirmationEmail(oldEmail);
    user.email = newEmail;
  }

  await user.save();
  res.send(userService.normalize(user));
};

const generateToken = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshAccessToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  generateToken,
  logout,
  passwordReset,
  resetPassword,
  updateProfile,
};
