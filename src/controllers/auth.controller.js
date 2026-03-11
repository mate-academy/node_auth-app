const { User } = require('../models/user.model');
const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exeptions/api.error');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service');

function validateEmail(value) {}

function validatePassword(value) {}

function validateName(value) {}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
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

  if (!user.activationToken) {
    throw ApiError.badRequest('User is activated');
  }

  user.activationToken = null;
  await user.save();

  // res.send(user);
  res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('User is not activated');
  }

  await generateTokens(res, user);
  res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unAuthorized();
  }

  const user = await userService.findByEmail(userData.email);

  return generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  // const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  // res.send({
  //   user: normalizedUser,
  //   accessToken,
  // });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unAuthorized();
  }

  await tokenService.remove(userData.id);

  // res.sendStatus(204);
  res.redirect(`${process.env.CLIENT_HOST}/login`);
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};

module.exports = { authController };
