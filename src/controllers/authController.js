'use strict';

const bcrypt = require('bcrypt');
const userService = require('../services/userService.js');
const jwtService = require('../services/jwtService.js');
const tokenService = require('../services/tokenService.js');
const emailService = require('../services/emailService.js');
const { ApiError } = require('../exceptions/ApiError.js');
const { User } = require('../models/User.js');

const REFRESH_TOKEN_MAX_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function register(req, res) {
  const { name, email, password } = req.body;

  const emailError = userService.validateEmail(email);

  if (emailError) {
    throw ApiError.BadRequest('Validation error', { email: emailError });
  }

  const passwordError = userService.validatePassword(password);

  if (passwordError) {
    throw ApiError.BadRequest('Validation error', { password: passwordError });
  }

  const userData = {
    email,
    password,
    name,
  };

  await userService.register(userData);

  res.send(userData);
}

async function activate(req, res) {
  const { activationToken } = req.params;

  const [numberOfAffectedRows, affectedRows] = await User.update(
    {
      activationToken: null,
      isActivated: true,
    },
    {
      where: { activationToken },
      returning: true,
    }
  );

  if (numberOfAffectedRows === 0) {
    return res.sendStatus(404);
  }

  await sendAuthentication(res, affectedRows[0]);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const [isActivated, isPasswordValid] = await Promise.all([
    user.isActivated,
    bcrypt.compare(password, user.password),
  ]);

  if (!isActivated) {
    throw ApiError.BadRequest('User is not activated');
  }

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is invalid');
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.BadRequest('Refresh token not provided');
    }

    const userData = jwtService.validateRefreshToken(refreshToken);

    if (!userData) {
      throw ApiError.Unauthorized();
    }

    const [token, user] = await Promise.all([
      tokenService.getByToken(refreshToken),
      userService.getByEmail(userData.email),
    ]);

    if (!token || !user) {
      throw ApiError.Unauthorized();
    }

    await sendAuthentication(res, user);
  } catch (error) {
    throw ApiError.Unauthorized('Refresh token expired', error);
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.cookies;
    const userData = jwtService.validateRefreshToken(refreshToken);

    if (userData) {
      await tokenService.remove(userData.id);
    }

    res.clearCookie('refreshToken');
    res.sendStatus(204);
  } catch (err) {
    throw ApiError.InternalServerError();
  }
}

async function sendRestorePasswordLink(req, res) {
  const { email } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User does not exist!');
  }

  user.restorePasswordToken = userService.generateRestorePasswordToken();

  const [updatedUser] = await Promise.all([
    user.save(),
    emailService.sendRestorePasswordLink({
      email,
      restorePasswordToken: user.restorePasswordToken,
    }),
  ]);

  if (!updatedUser) {
    throw ApiError.InternalServerError('Failed to update user!');
  }

  res.send({ message: 'Restore password link is sent!' });
}

async function checkRestoreCode(req, res) {
  const { restorePasswordToken } = req.body;

  if (!restorePasswordToken) {
    throw ApiError.BadRequest('Please provide restore password token');
  }

  const user = await User.findOne({
    where: { restorePasswordToken },
  });

  if (!user) {
    throw ApiError.BadRequest('Restore Code is incorrect');
  }

  user.restorePasswordToken = null;
  await user.save();

  res.sendStatus(200);
}

async function changePassword(req, res) {
  const { email, password, confirmation } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User does not exist!');
  }

  if (password !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match!');
  }

  const newPasswordHash = await bcrypt.hash(password, 10);

  user.password = newPasswordHash;
  await user.save();

  res.send({ message: 'Password is updated!' });
}

async function sendAuthentication(res, user) {
  try {
    const userData = userService.normalize(user);

    const [accessToken, refreshToken] = [
      jwtService.generateAccessToken(userData),
      jwtService.generateRefreshToken(userData),
    ];

    await tokenService.save(user.id, refreshToken);

    setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, userData, accessToken);
  } catch (error) {
    throw ApiError.InternalServerError();
  }
}

function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    maxAge: REFRESH_TOKEN_MAX_DAYS,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
}

function sendResponse(res, userData, accessToken) {
  res.send({
    user: userData,
    accessToken,
  });
}

module.exports = {
  authController: {
    register,
    activate,
    login,
    refresh,
    logout,
    sendRestorePasswordLink,
    checkRestoreCode,
    changePassword,
  },
};
