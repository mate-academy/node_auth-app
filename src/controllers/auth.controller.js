const { User } = require('../models/user');
const bcrypt = require('bcrypt');

const {
  findByEmail,
  normalize,
  registerUser,
} = require('../services/user.service');

const { sign, verifyRefresh, signRefresh } = require('../services/jwt.service');
const { ApiError } = require('../exceptions/api.error');
const { save, getByToken, remove } = require('../services/token.service');

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

const generateTokens = async (res, user) => {
  const normalizedUser = normalize(user);
  const accessToken = sign(normalizedUser);
  const refreshToken = signRefresh(normalizedUser);

  await save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const register = async (req, res) => {
  const { email, password } = req.body;
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError('Bad request', errors);
  }

  const hashPass = await bcrypt.hash(password, 10);
  await registerUser(email, hashPass);
  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;

  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such users');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);

  // const normalizeDUser = normalize(user);
  // const accessToken = sign(normalizeDUser);

  // res.send({
  //   user: normalizeDUser,
  //   accessToken,
  // });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await verifyRefresh(refreshToken);

  const token = await getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await remove(userData.id);

  res.sendStatus(204);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
};
