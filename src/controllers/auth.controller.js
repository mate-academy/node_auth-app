const bcrypt = require('bcrypt');
const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { tokenService } = require('../services/token.service');
const { passwordService } = require('../services/password.service');
const { User } = require('../models/user');
const {
  validateEmail,
  validateName,
  validatePassword,
} = require('../utils/validators');
const { ApiError } = require('../exeptions/api.error');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateName(name),
  };

  if (errors.email || errors.password || errors.name) {
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
  user.save();

  const normalizedUser = userService.normalizeUser(user);

  res.send(normalizedUser);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalizeUser(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    normalizedUser,
    accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await passwordService.checkPasswordValid(
    user.password,
    password,
  );

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest(
      'Please activate your account. Check your email for activation link.',
    );
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.sendStatus(204);
};

const passwordReset = async (req, res) => {
  const { email } = req.body;

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest('Incorrect email', { email: emailError });
  }

  await passwordService.requestReset(email);

  // Send a general message for security reasons
  res.send({
    message:
      'If your email address exists in our system,' +
      ' you will receive a link to reset your password.',
  });
};

// Verify password reset token
const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  const user = await passwordService.verifyResetToken(token);

  if (!user) {
    throw ApiError.badRequest(
      'The password reset token is invalid or has expired.',
    );
  }

  res.send({ message: 'Token is valid', token });
};

// Update password
const updatePassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  // Password validation
  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Incorrect password', {
      password: passwordError,
    });
  }

  // Check if the passwords match
  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match.', {
      confirmPassword: 'Passwords do not match.',
    });
  }

  // Use the service to update the password
  await passwordService.updatePassword(token, password);

  res.send({ message: 'Пароль успішно оновлено' });
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  passwordReset,
  verifyResetToken,
  updatePassword,
};

module.exports = { authController };
