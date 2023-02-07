'use strict';

import validation from '../utils/validation.js';
import { ApiError } from '../exceptions/ApiError.js';
import userService from '../services/userService.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwtService from '../services/jwtService.js';
import tokenService from '../services/tokenService.js';
import emailService from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import socialAuthServices from '../services/socialAuthServices.js';
import { GoogleData } from '../models/GoogleData.js';

const register = async(req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validation.validateName(name),
    email: validation.validateEmail(email),
    password: validation.validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register(name, email, password);

  res.status(200).send({ message: 'OK' });
};

const activate = async(req, res, next) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: {
      activationToken,
    },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
};

const login = async(req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, user);
};

const refresh = async(req, res, next) => {
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
};

const logout = async(req, res, next) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
};

const sendAuthentication = async(res, user) => {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(userData.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.status(201).send({
    user: userData,
    accessToken,
  });
};

const reset = async(req, res) => {
  const { email } = req.body;

  await userService.reset(email);

  res.status(200).send({ message: 'OK' });
};

const resetPassword = async(req, res) => {
  const { resetToken } = req.params;
  const { newPassword, passwordConfirmation } = req.body;

  const user = await User.findOne({
    where: { resetToken },
  });

  if (!user) {
    throw ApiError.NotFound('Wrong reset token');
  }

  const errors = {
    newPassword: validation.validatePassword(newPassword),
    passwordConfirmation: validation.validatePassword(passwordConfirmation),
    passwordsMatching: validation
      .validatePasswordsMatching(newPassword, passwordConfirmation),
  };

  if (errors.newPassword
    || errors.passwordConfirmation
    || errors.passwordsMatching) {
    throw ApiError('Validation error', errors);
  }

  const hash = await bcrypt.hash(newPassword, 10);

  user.password = hash;
  user.resetToken = null;

  await user.save();

  res.status(200).send({ message: 'OK' });
};

const changeName = async(req, res) => {
  const { refreshToken } = req.cookies;
  const { newName } = req.body;

  const userData = await userService.checkIfAuthorized(refreshToken);

  const errors = {
    newName: validation.validateName(newName),
  };

  if (errors.newName) {
    throw ApiError.BadRequest('Invalid name', errors);
  }

  const user = await userService.getByEmail(userData.email);

  user.name = newName;

  await user.save();

  await sendAuthentication(res, user);
};

const changeEmail = async(req, res) => {
  const { refreshToken } = req.cookies;
  const { password, newEmail } = req.body;

  const userData = await userService.checkIfAuthorized(refreshToken);

  const errors = {
    newEmail: validation.validateEmail(newEmail),
  };

  if (errors.newEmail) {
    throw ApiError.BadRequest('Invalid email', errors);
  }

  const existingError = await userService.getByEmail(newEmail);

  if (existingError) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken',
    });
  }

  const user = await userService.getByEmail(userData.email);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await emailService.sendEmailChangeNotification(user.email);

  const activationToken = uuidv4();

  user.email = newEmail;
  user.activationToken = activationToken;

  await user.save();

  await emailService.sendActivalionLink(newEmail, activationToken);

  res.status(200).send({ message: 'OK' });
};

const changePassword = async(req, res) => {
  const { password, newPassword, passwordConfirmation } = req.body;
  const { refreshToken } = req.cookies;

  const userData = await userService.checkIfAuthorized(refreshToken);

  const user = await userService.getByEmail(userData.email);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  const errors = {
    newPassword: validation.validatePassword(newPassword),
    passwordConfirmation: validation.validatePassword(passwordConfirmation),
    passwordsMatching: validation
      .validatePasswordsMatching(newPassword, passwordConfirmation),
  };

  if (errors.newPassword
    || errors.passwordConfirmation
    || errors.passwordsMatching) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const hash = await bcrypt.hash(newPassword, 10);

  user.password = hash;

  await user.save();

  await sendAuthentication(res, user);
};

const authWithGoogle = async(req, res) => {
  const { code } = req.query;

  const token = await socialAuthServices.getGoogleAccessTokenFromCode(code);
  const userData = await socialAuthServices.getGoogleUserInfo(token);

  if (!userData.verified_email) {
    throw ApiError.UnprocessableEntity('Email does not verified by Google');
  }

  const existingUser = await userService.getByEmail(userData.email);
  let userId = existingUser?.id || null;
  let normalizedUser = existingUser
    ? userService.normalize(existingUser)
    : null;

  if (!existingUser) {
    const createdUser = await userService.createUser({
      name: userData.given_name, email: userData.email, isGoogleConnected: true,
    });

    userId = createdUser.dataValues.id;
    normalizedUser = userService.normalize(createdUser.dataValues);
  }

  const googleData = await socialAuthServices
    .getGoogleData(userId);

  if (!googleData) {
    await socialAuthServices.saveGoogleData({
      email: userData.email,
      verifiedEmail: userData.verified_email,
      name: userData.name,
      givenName: userData.given_name,
      familyName: userData.family_name,
      userId,
    });
  }

  const refreshToken = jwtService.generateRefreshToken(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.redirect(302, process.env.CLIENT_URL);
};

const connectGoogle = async(req, res) => {
  const { code } = req.query;
  const { refreshToken } = req.cookies;

  const existingUser = await jwtService.validateRefreshToken(refreshToken);

  if (!existingUser) {
    throw ApiError.Unauthorized();
  }

  const existingToken = await tokenService.getByToken(refreshToken);

  if (!existingToken) {
    throw ApiError.Unauthorized();
  }

  const token = await socialAuthServices
    .getGoogleConnectAccessTokenFromCode(code);
  const userData = await socialAuthServices.getGoogleUserInfo(token);

  const foundedUser = await userService.getByEmail(existingUser.email);

  foundedUser.isGoogleConnected = true;
  await foundedUser.save();

  await socialAuthServices.saveGoogleData({
    email: userData.email,
    verifiedEmail: userData.verified_email,
    name: userData.name,
    givenName: userData.given_name,
    familyName: userData.family_name,
    userId: foundedUser.id,
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.redirect(302, process.env.CLIENT_URL);
};

const disconnectGoogle = async(req, res) => {
  const { refreshToken } = req.cookies;

  const existingUser = await jwtService.validateRefreshToken(refreshToken);

  if (!existingUser) {
    throw ApiError.Unauthorized();
  }

  const existingToken = await tokenService.getByToken(refreshToken);

  if (!existingToken) {
    throw ApiError.Unauthorized();
  }

  const updatedUser = await userService.getByEmail(existingUser.email);

  updatedUser.isGoogleConnected = false;

  await updatedUser.save();

  await GoogleData.destroy({
    where: {
      userId: existingUser.id,
    },
  });

  res.send({ updatedUser: userService.normalize(updatedUser) });
};

export default {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  resetPassword,
  changeName,
  changeEmail,
  changePassword,
  authWithGoogle,
  connectGoogle,
  disconnectGoogle,
};
