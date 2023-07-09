'use strict';

const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');

const UsersService = require('../../users/users.service');
const EmailService = require('./email.service');
const JwtService = require('./jwt.service');
const TokenService = require('./token.service');

const ApplicationErrors = require('../../exceptions/application.errors');

const validateEmail = (email) => {
  if (!email) {
    throw ApplicationErrors.BadRequest('Email should be added');
  }

  const emailPattern = /^[\w.-]+@[\w.-]+\.\w+$/;

  if (!emailPattern.test(email)) {
    throw ApplicationErrors.BadRequest('Email should be valid');
  }
};

const validatePassword = (password) => {
  if (!password) {
    throw ApplicationErrors.BadRequest('Password is required');
  }

  if (password.length < 8) {
    throw ApplicationErrors.BadRequest(
      'The password length should not be less than 8 characters'
    );
  }
};

const register = async(email, password) => {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApplicationErrors.BadRequest('Validation error', errors);
  }

  const existUser = await UsersService.getOneByEmail(email);

  if (existUser) {
    throw ApplicationErrors.BadRequest(
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
    throw ApplicationErrors.NotFound();
  }

  await user.save();

  return user;
};

const logIn = async(email, password) => {
  const user = await UsersService.getOneByEmail(email);

  if (!user.dataValues
    || !await bcrypt.compare(password, user.dataValues.password)
  ) {
    throw ApplicationErrors.Unauthorized();
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
    throw ApplicationErrors.Unauthorized();
  }

  const token = await TokenService.getByToken(refreshToken);

  if (!token) {
    throw ApplicationErrors.Unauthorized();
  }

  const user = await UsersService.getOneByEmail(userData.email);

  const accessToken = JwtService.generateAccessToken(user.dataValues);
  const generatedRefreshToken = JwtService.generateRefreshToken(
    user.dataValues
  );

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
    throw ApplicationErrors.BadRequest('Validation error', errors);
  }

  const user = await UsersService.getOneByEmail(email);

  if (!user) {
    throw ApplicationErrors.NotFound('User not found');
  }

  const hashedPassword = await UsersService.hashPassword(password);

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
