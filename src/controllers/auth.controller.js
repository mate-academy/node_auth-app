const uuid = require('uuid');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User.model');

const usersService = require('../services/users.service');
const emailService = require('../services/email.service');
const hashService = require('../services/hash.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {};
  let existingUser;

  if (!name) {
    errors.name = 'Name is empty';
  }

  if (!email) {
    errors.email = 'Email is empty';
  } else {
    existingUser = await usersService.findByEmail(email);
  }

  if (existingUser) {
    errors.email = 'User with this email already exists';
  }

  if (!password) {
    errors.password = 'Password is empty';
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Invalid credentials', errors);
  }

  const activationToken = uuid.v4();

  const hashedPassword = await hashService.hashPassword(password);

  const newUser = await User.create({
    name,
    email,
    hashedPassword,
    activationToken,
  });

  await emailService.sendActivation(activationToken, email);

  res.send(usersService.normalize(newUser));
};

const activate = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw ApiError.badRequest('Invalid token', { token: 'Invalid token' });
  }

  const result = await usersService.activate(token);

  if (!result) {
    throw ApiError.badRequest('Invalid token', { token: 'Invalid token' });
  }

  res.sendStatus(200);
};

async function generateTokens(res, user) {
  const normalizedUser = usersService.normalize(user);

  const refreshToken = jwtService.signRefresh(normalizedUser, '1d');
  const accessToken = jwtService.sign(normalizedUser, '10m');

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    HttpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = {};
  let existingUser;

  if (!email) {
    errors.email = 'Email is required';
  } else {
    existingUser = await usersService.findByEmail(email);

    if (!existingUser) {
      errors.email = 'User with this email does not exist';
    }
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (existingUser) {
    const isPasswordValid = await hashService.verifyPassword(
      password,
      existingUser.hashedPassword,
    );

    if (!isPasswordValid) {
      errors.password = 'Invalid password';
    } else if (existingUser.activationToken) {
      errors.activation = 'Activate your account first';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Invalid credentials', errors);
  }

  await generateTokens(res, existingUser);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await usersService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
};
