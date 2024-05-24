'use strict';

const { User } = require('../models/user.model.js');
const { normalizeUser } = require('../utils/normalizeUser.js');
const { sendMail } = require('../services/sendMail.js');
const { ApiError } = require('../exeptions/api.error.js');
const { token } = require('../services/token.js');
const bcrypt = require('bcrypt');

function getRegistrationForm(req, res) {
  res.send(`
    <form action="/registration" method="POST">
      <input type="name" name="name" placeholder="name" required />
      <input type="email" name="email" placeholder="email" required />
      <input type="password" name="password" placeholder="password" required />
      <button type="submit">Login</button>
    </form>
  `);
}

async function registration(req, res) {
  const { name, email, password } = req.body;

  const hashPassword = await bcrypt.hash(password, 3);

  const user = await User.create({ name, email, password: hashPassword });

  if (!user) {
    throw ApiError.badRequest({ message: 'user already exists' });
  }

  const payload = { name, email };
  const activateToken = token.getToken(payload, 'activate');

  const url = `http://localhost:3005/activation/${activateToken}`;

  await sendMail(email, url);

  res.status(201).json(normalizeUser(user));
}

async function activation(req, res) {
  const { activationToken } = req.params;

  const { email } = token.verifyToken(activationToken, 'activate');

  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.badRequest({ message: 'activation token invalid' });
  }

  if (user.isActive) {
    throw ApiError.badRequest({ message: 'user already active' });
  }

  user.isActive = true;
  user.save();

  res.status(300).redirect(`http://localhost:3005/profile/${user.id}`);
}

async function getloginPage(req, res) {
  res.send(`
  <form action="/login" method="POST">
      <input type="email" name="email" placeholder="email" required />
      <input type="password" name="password" placeholder="password" required />
      <button type="submit">Login</button>
    </form>
  `);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest({ message: 'user not found' });
  }

  if (!user.isActive) {
    throw ApiError.badRequest({ message: 'user not activated' });
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    throw ApiError.badRequest({ message: 'incorect password' });
  }

  const accessToken = token.getToken({}, 'access', { expiresIn: '360s' });
  const refreshToken = token.getToken({}, 'refresh', { expiresIn: '3600s' });

  user.accsessToken = accessToken;
  user.refreshToken = refreshToken;

  await user.save();

  res.cookie('accessToken', accessToken, { httpOnly: true, secure: false });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });

  res.status(300).redirect(`/profile/${user.id}`);
}

async function authenticateToken(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;
  const { userId } = req.params;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

  if (!accessToken || !refreshToken) {
    throw ApiError.unauthorized({ message: 'user not logged in' });
  }

  const resultOfAccessToken = token.verifyToken(accessToken, 'access');
  const resultOfrefreshToken = token.verifyToken(refreshToken, 'refresh');

  if (!resultOfAccessToken && resultOfrefreshToken) {
    const newAccessToken = token.getToken({}, 'access', { expiresIn: '360s' });

    user.accsessToken = newAccessToken;
    await user.save();

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false,
    });

    next();

    return;
  }

  if (!resultOfAccessToken && !resultOfrefreshToken) {
    throw ApiError.unauthorized({ message: 'user not logged in' });
  }

  next();
}

async function logout(req, res) {
  const { userId } = req.params;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

  user.accsessToken = null;
  user.refreshToken = null;
  await user.save();

  res.status(300).redirect('/login');
}

module.exports = {
  authController: {
    getRegistrationForm,
    registration,
    activation,
    getloginPage,
    login,
    logout,
    authenticateToken,
  },
};
