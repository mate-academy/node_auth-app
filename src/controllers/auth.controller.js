'use strict';

const bcrypt = require('bcrypt');

const { User } = require('../models/user.js');
const { ApiError } = require('../exeptions/api.error.js');
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const tokenService = require('../services/token.service.js');
const emailService = require('../services/email.service.js');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async(req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (errors.email || errors.password) {
      throw ApiError.badRequest('Bad request', errors);
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await userService.register(name, email, hashedPass);

    res.send({
      message: 'OK',
    });
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const activate = async(req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await User.findOne({
      where: { activationToken },
    });

    if (!user) {
      res.sendStatus(404);

      return;
    }

    user.activationToken = null;
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const login = async(req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest('No such user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Wrong password');
    }

    await generateToken(res, user);
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const generateToken = async(res, user) => {
  try {
    const normalizedUser = userService.normalize(user);
    const accessToken = jwtService.sign(normalizedUser);
    const refreshAccessToken = jwtService.signRefresh(normalizedUser);

    await tokenService.save(normalizedUser.id, refreshAccessToken);

    res.cookie('refreshToken', refreshAccessToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.send({
      user: normalizedUser,
      accessToken,
    });
  } catch (error) {
    throw ApiError.internalServerError('Token generation failed');
  }
};

const refresh = async(req, res) => {
  try {
    const { refreshToken } = req.cookies;

    const userData = await jwtService.verifyRefresh(refreshToken);
    const token = await tokenService.getByToken(refreshToken);

    if (!userData || !token) {
      throw ApiError.unauthorized();
    }

    const user = await userService.findByEmail(userData.email);

    await generateToken(res, user);
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const logout = async(req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const userData = jwtService.verifyRefresh(refreshToken);

    if (!userData || !refreshToken) {
      throw ApiError.unauthorized();
    }

    await tokenService.remove(userData.id);

    res.sendStatus(204);
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const reset = async(req, res, next) => {
  try {
    const { email } = req.body;

    const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

    if (!emailPattern.test(email)) {
      throw ApiError.badRequest('Invalid email', { email: 'Invalid email' });
    }

    const user = await userService.findActiveUser(email);
    const resetToken = jwtService.generateToken();

    await Promise.all([
      userService.updateResetToken(resetToken, user),
      emailService.sendResetMail(email, resetToken),
    ]);

    res.send({ message: 'Reset token has been send. Check your email!' });
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const confirmReset = async(req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      throw ApiError.BadRequest(
        'Invalid password',
        {
          password: 'Invalid password',
        }
      );
    }

    const user = await tokenService.getByToken(resetToken);

    if (!user) {
      throw ApiError.notFound();
    }

    await Promise.all([
      userService.updatePassword(user, password),
      userService.consumeToken('resetToken', user),
    ]);

    res.send({ message: 'Successfully changed password. Please login!' });
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  confirmReset,
};
