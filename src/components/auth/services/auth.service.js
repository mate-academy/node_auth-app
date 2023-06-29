'use strict';

const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');

const UsersService = require('../../users/users.service');
const EmailService = require('./email.service');
const JwtService = require('./jwt.service');
const TokenService = require('./token.service');

const ExceptionsErrors = require('../../exceptions/exceptions.errors');

const validateEmail = (email) => {
  if (!email) {
    return 'Email should be added';
  }

  const emailPattern = /^[\w.-]+@[\w.-]+\.\w+$/;

  if (!emailPattern.test(email)) {
    return 'Email should be valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'The password length should not be less than 8 characters';
  }
};

const register = async(email, password) => {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ExceptionsErrors.BadRequest('Validation error', errors);
  }

  const existUser = await UsersService.getOneByEmail(email);

  if (existUser.dataValues) {
    throw ExceptionsErrors.BadRequest(
      'BadRequestException', { email: 'User already exists with such email' }
    );
  }

  const activationToken = uuid();

  const user = await UsersService.save(email, password, activationToken);

  await EmailService.send({
    email: user.email,
    subject: 'Activation',
    html: `<h1>Activation ${activationToken}</h1>`,
  });

  return user;
};

const activate = async(activationToken) => {
  const user = await UsersService.findOneByActivationToken(activationToken);

  if (!user) {
    throw ExceptionsErrors.NotFound();
  }

  user.activationToken = null;

  await user.save();

  return user;
};

const logIn = async(email, password) => {
  const user = await UsersService.getOneByEmail(email);

  if (!user.dataValues
    || !await bcrypt.compare(password, user.dataValues.password)
  ) {
    throw ExceptionsErrors.Unauthorized();
  }

  const accessToken = JwtService.generateAccessToken(user.dataValues);
  const refreshToken = JwtService.generateRefreshToken(user.dataValues);

  await TokenService.save(user.id, refreshToken);

  return {
    user: {
      id: user.dataValues.id,
      email: user.dataValues.email,
    },
    accessToken,
    refreshToken,
  };
};

const refresh = async(refreshToken) => {
  const userData = JwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ExceptionsErrors.Unauthorized();
  }

  const token = await TokenService.getByToken(refreshToken);

  if (!token) {
    throw ExceptionsErrors.Unauthorized();
  }

  const user = await UsersService.getOneByEmail(userData.email);

  const accessToken = JwtService.generateAccessToken(user.dataValues);
  // eslint-disable-next-line max-len
  const generatedRefreshToken = JwtService.generateRefreshToken(user.dataValues);

  await TokenService.save(user.dataValues.id, generatedRefreshToken);

  return {
    user: {
      id: user.dataValues.id,
      email: user.dataValues.email,
    },
    accessToken,
  };
};

const logOut = async(refreshToken) => {
  const userData = JwtService.validateRefreshToken(refreshToken);

  if (userData) {
    await TokenService.remove(userData.id);
  }
};

const refreshPassword = async(email, password) => {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ExceptionsErrors.BadRequest('Validation error', errors);
  }

  const user = await UsersService.getOneByEmail(email);

  if (!user) {
    throw ExceptionsErrors.NotFound('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await UsersService.updatePassword(hashedPassword, user.id);
};

module.exports = {
  register,
  activate,
  logIn,
  refresh,
  logOut,
  refreshPassword,
};
