'use strict';

const userService = require('../services/userService.js');
const jwtService = require('../services/jwtService.js');
const tokenService = require('../services/tokenService.js');
const { ApiError } = require('../exceptions/ApiError.js');
const { User } = require('../models/User.js');

async function register(req, res) {
  const { name, email, password } = req.body;

  const emailError = userService.validateEmail(email);
  const passwordError = userService.validatePassword(password);

  if (emailError || passwordError) {
    const errors = {
      email: emailError,
      password: passwordError,
    };

    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({
    name,
    email,
    password,
  });

  res.send({ message: 'User created' });
}

async function activate(req, res) {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
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

module.exports = {
  authController: {
    register,
    activate,
  },
};
