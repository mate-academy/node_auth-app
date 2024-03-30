const { ApiError } = require('../exceptions/ApiError.js');
const { User } = require('../models/User.js');
const { jwtService } = require('../services/jwtService.js');
const { tokenService } = require('../services/tokenService.js');
const { userService } = require('../services/userService.js');
const { validate } = require('../utils/validate.js');
const { bcryptService } = require('../services/bcryptService.js');

async function register(req, res, next) {
  const { name, email, password } = req.body;

  const errors = {
    name: validate.name(name),
    email: validate.email(email),
    password: validate.password(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({ name, email, password });

  res.sendStatus(200);
}

async function activate(req, res, next) {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    throw ApiError.NotFound('user');
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcryptService.compare(password, user.password);

  if (isPasswordValid) {
    throw ApiError.BadRequest('Validation error', isPasswordValid);
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function forgotPassword(req, res, next) {
  const { email } = req.body;
  const { refreshToken } = req.cookies;

  const errors = {
    email: validate.email(email),
  };

  if (errors.email) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const userData = await jwtService.validateRefreshToken(refreshToken);

  if (userData) {
    throw ApiError.BadRequest('User is logged in');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.Unauthorized('No such user');
  }

  await userService.forgotPassword(user);

  res.sendStatus(200);
}

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

async function resetPassword(req, res, next) {
  const { activationToken } = req.params;

  const { password, confirmation } = req.body;

  const errors = {
    password: validate.password(password),
  };

  if (errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  if (password !== confirmation) {
    throw ApiError.BadRequest('Passwords are not equal');
  }

  await userService.resetPassword(activationToken, password);

  res.sendStatus(200);
}

module.exports = {
  authController: {
    register,
    activate,
    login,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
  },
};
