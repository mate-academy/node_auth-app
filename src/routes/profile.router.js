const { User } = require('../models/User.model');
const { ApiError } = require('../exceptions/api.error');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./email.service');
const userService = require('./user.service');
const bcrypt = require('bcrypt');
const jwtService = require('./jwt.service');
const tokenService = require('./token.service');
const { checkRequired } = require('../utils/checkRequired');
const { validateEmail } = require('../utils/validateEmail');
const { validatePassword } = require('../utils/validatePassword');

const register = async ({ name, email, password }) => {
  const errors = {
    name: checkRequired(name, 'name'),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.name || errors.password) {
    throw ApiError.BadRequest('bad request', errors);
  }

  if (await userService.getByEmail(email)) {
    throw ApiError.BadRequest('bad request', {
      userExists: 'user already exists',
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();
  const newUser = await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return newUser;
};

const activate = async (activationToken) => {
  const user = await userService.getByActivationToken(activationToken);

  if (!user) {
    throw ApiError.notFound();
  }

  user.activationToken = null;
  user.save();

  return user;
};

const generateTokens = async (user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  return { user: normalizedUser, refreshToken, accessToken };
};

const login = async ({ email, password }) => {
  const errors = {
    email: checkRequired(email, 'email'),
    password: checkRequired(password, 'password'),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('bad request', errors);
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('no such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('wrong password');
  }

  return generateTokens(user);
};

const refresh = async (refreshToken) => {
  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  return generateTokens(user);
};

const logout = async (refreshToken) => {
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.Unauthorized();
  }

  await tokenService.remove(userData.id);
};

const passReset = async (email) => {
  if (!email) {
    throw ApiError.BadRequest('bad request', { email: 'email is required' });
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('bad request', {
      noUser: 'no user with such email was found',
    });
  }

  await emailService.sendPassConfirmationEmail(email, user.id);

  return userService.normalize(user);
};

const passResetConfirm = async (accessToken, newPass, newPassConfirmation) => {
  const errors = {
    accessToken: checkRequired(accessToken, 'user id'),
    newPass: validatePassword(newPass),
    newPassConfirmation: checkRequired(
      newPassConfirmation,
      'new password confirmation',
    ),
  };

  if (errors.userId || errors.newPassConfirmation || errors.newPass) {
    throw ApiError.BadRequest('bad request', errors);
  }

  const user = await userService.getByAccessToken(accessToken);

  if (!user) {
    throw ApiError.notFound();
  }

  if (!(newPass === newPassConfirmation)) {
    throw ApiError.BadRequest('entered passwords are not equal');
  }

  user.password = await bcrypt.hash(newPass, 10);
  user.save();

  return user;
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  passReset,
  passResetConfirm,
};
