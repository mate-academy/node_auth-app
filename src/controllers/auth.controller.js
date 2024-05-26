'use strict';

const { normalizeUser } = require('../utils/normalizeUser.js');
const { ApiError } = require('../exeptions/api.error.js');
const { token, generateTokens } = require('../services/token.js');
const {
  createUser,
  findUserByEmail,
  activateUser,
  verifyPassword,
  updateUserTokens,
  findUserById,
  updateAccessTokenOnly,
} = require('../services/user.service.js');
const { sendActivationEmail } = require('../services/mail.service.js');

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

  const user = await createUser(name, email, password);

  await sendActivationEmail(email, name);

  res.status(201).json(normalizeUser(user));
}

async function activation(req, res) {
  const { activationToken } = req.params;

  const { email } = token.verifyActivationToken(activationToken);

  const user = await findUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest({ message: 'activation token invalid' });
  }

  if (user.isActive) {
    throw ApiError.badRequest({ message: 'user already active' });
  }

  await activateUser(user);

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
  const user = await findUserByEmail(email);

  if (!user.isActive) {
    throw ApiError.badRequest({ message: 'user not activated' });
  }

  await verifyPassword(password, user.password);

  const [accessToken, refreshToken] = generateTokens();

  await updateUserTokens(user, accessToken, refreshToken);

  res.cookie('accessToken', accessToken, { httpOnly: true, secure: false });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });

  res.status(300).redirect(`/profile/${user.id}`);
}

async function authenticateToken(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;
  const { userId } = req.params;

  const user = await findUserById(userId);

  if (!accessToken || !refreshToken) {
    throw ApiError.unauthorized({ message: 'user not logged in' });
  }

  const [resultOfAccessToken, resultOfrefreshToken] =
    token.verifyAccssesRefreshTokens(accessToken, refreshToken);

  if (!resultOfAccessToken && resultOfrefreshToken) {
    const [newAccessToken] = generateTokens();

    await updateAccessTokenOnly(user, newAccessToken);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false,
    });

    next();

    return;
  }

  next();
}

async function logout(req, res) {
  const { userId } = req.params;

  const user = await findUserById(userId);

  await updateUserTokens(user, null, null);

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
