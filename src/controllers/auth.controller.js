const { User } = require('../models/user');
const { UsersServices } = require('../services/users.service');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exeptions/api.errors');
const { validateEmail, validatePassword } = require('../utils/validation');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPath = await bcrypt.hash(password, 10);

  await UsersServices.register(name, email, hashedPath);

  res.send({ message: 'Done' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await UsersServices.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.coolies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unAuthorized();
  }

  const user = await UsersServices.findByEmail(userData.email);

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = UsersServices.normalize(user);

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
  const { refreshToken } = req.coolies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unAuthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};

module.exports = {
  authController,
};
