'use strict';

const bcrypt = require('bcrypt');
const userSevices = require('../services/userServices.js');
const jwtServices = require('../services/jwtServices.js');
const { User } = require('../models/user.js');
const { ApiError } = require('../exeption/apiError.js');
const tokenSevices = require('../services/tokenServices.js');
const validate = require('../utils/validate.js');

const register = async(req, res) => {
  const { name, email, password } = req.body;

  try {
    await userSevices.register(name, email, password);
  } catch (error) {
    throw ApiError.serverError(error);
  }

  res.send({ message: 'OK' });
};

const activate = async(req, res) => {
  const { activationToken } = req.params;

  try {
    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      res.sendStatus(404);

      return;
    }

    user.activationToken = null;
    user.save();

    res.send(user);
  } catch (error) {
    throw ApiError.serverError(error);
  }
};

const generateToken = async(res, user) => {
  const normalizedUser = userSevices.normalize(user);
  const accessToken = jwtServices.sign(normalizedUser);
  const refrashToken = jwtServices.signRefresh(normalizedUser);

  try {
    await tokenSevices.save(normalizedUser.id, refrashToken);
  } catch (error) {
    throw ApiError.serverError(error);
  }

  res.cookie('refrashToken', refrashToken, {
    maxAge: 30 * 24 * 60 * 60 * 100,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const login = async(req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userSevices.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest('No such user');
    }

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Wrong password');
    };

    await generateToken(res, user);
  } catch (error) {
    throw ApiError.serverError(error);
  }
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;

  try {
    const userData = await jwtServices.verifyRefresh(refreshToken);
    const token = await tokenSevices.getByToken(refreshToken);

    if (!userData || !token) {
      throw ApiError.unauthorization();
    }

    const user = await userSevices.findByEmail(userData.email);

    await generateToken(res, user);
  } catch (error) {
    throw ApiError.serverError(error);
  }
};

const logout = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtServices.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorization();
  }

  await tokenSevices.remove(userData.id);

  res.sendStatus(204);
};

const resetPass = async(req, res) => {
  const { email } = req.body;

  try {
    await userSevices.resetPassword(email);
  } catch (error) {
    throw ApiError.serverError(error);
  }

  res.send({ message: 'OK' });
};

const setPassword = async(req, res) => {
  const { resetToken } = req.params;
  const { newPassword, confirmation } = req.body;

  try {
    const user = await User.findOne({ where: { resetToken } });

    if (!user) {
      res.sendStatus(404);

      return;
    }

    const isValidNewPassword = validate.newPassword(
      user.password,
      newPassword,
      confirmation
    );

    if (isValidNewPassword) {
      throw ApiError.badRequest('Validation error', { isValidNewPassword });
    }

    const hashedNewPas = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPas;
    user.resetToken = null;
    user.save();

    res.send(userSevices.normalize(user));
  } catch (error) {
    throw ApiError.serverError(error);
  }
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPass,
  setPassword,
};
