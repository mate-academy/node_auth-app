const { User } = require('../models');
const {
  usersService,
  jwtService,
  tokenService,
  emailService,
} = require('../services');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../exceptions');
const bcrypt = require('bcrypt');

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const errors = {
    name: !name ? 'Name is required' : undefined,
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad Request', errors);
  }

  await usersService.register({ name, email, password });
  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(
    res,
    user,
    (process.env.CLIENT_URL || 'http://localhost:5173') + '/profile',
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Confirm your email first');
  }

  if (!user.password) {
    throw ApiError.badRequest(
      'No local password set. Please sign in with your social provider.',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await sendAuthentication(
    res,
    user,
    (process.env.CLIENT_URL || 'http://localhost:5173') + '/profile',
  );
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.unauthorized();
  }

  const user = await usersService.getByEmail(userData.email);

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/login');
};

const sendAuthentication = async (res, user, redirectUrl) => {
  const userData = usersService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(userData.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  if (redirectUrl) {
    return res.redirect(redirectUrl);
  }

  res.send({
    user: userData,
    accessToken,
  });
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await usersService.getByEmail(email);

  if (!user) {
    return res.redirect(
      (process.env.CLIENT_URL || 'http://localhost:5173') +
        '/reset-password-sent',
    );
  }

  user.resetPasswordToken = uuidv4();
  await user.save();

  await emailService.sendResetPasswordEmail(
    user.email,
    user.resetPasswordToken,
  );

  res.redirect(
    (process.env.CLIENT_URL || 'http://localhost:5173') +
      '/reset-password-sent',
  );
};

const resetPasswordConfirmation = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (!password || password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const errors = {
    password: validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad Request', errors);
  }

  const user = await User.findOne({ where: { resetPasswordToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  await user.save();

  res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/login');
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  resetPasswordConfirmation,
};
