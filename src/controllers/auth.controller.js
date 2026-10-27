const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.js');
const { jwtService } = require('../services/jwt.service.js');
const { tokenService } = require('../services/token.service.js');
const { userService } = require('../services/user.service.js');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await userService.register(name, email, hashPassword);

  res.send(userService.normalize(user));
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user || user.activationToken !== activationToken) {
    throw ApiError.notFound('Validation error');
  }

  user.activationToken = null;

  await user.save();

  sendAuthentication(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Activate the user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  sendAuthentication(res, user);
};

async function sendAuthentication(res, user) {
  const normalizedUser = userService.normalize(user);
  const refreshToken = jwtService.generateRefreshToken(normalizedUser);
  const accessToken = jwtService.generateAccessToken(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({
    user: normalizedUser,
    accessToken,
  });
}

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const userData = jwtService.validateRefreshToken(refreshToken);
  // const token = await tokenService.getByToken(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized('Invalid token');
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized('Invalid token');
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
};
