const { normalizeUser } = require('../utils/normalizeUser.js');
const { validateEmail, validatePassword } = require('../utils/validation.js');
const { UsersServices } = require('../services/users.service');
const { mailer } = require('../utils/mailer.js');
const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');
const { jwt } = require('../utils/jwt.js');
const { TokenServices } = require('../services/token.service.js');

const sendAuthentication = async (res, user) => {
  const userData = normalizeUser(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await TokenServices.deleteByUserId(user.id);
  await TokenServices.create(user.id, refreshToken);

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
};

const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.sendStatus(422);
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await UsersServices.getByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const activationToken = uuid();

  const newUser = await UsersServices.createUser(
    email,
    password,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.send(normalizeUser(newUser));
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await UsersServices.getByEmail(email);

  if (!user || user.activationToken !== token) {
    res.sendStatus(404);

    return;
  }

  await UsersServices.activate(email);

  sendAuthentication(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await UsersServices.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.sendStatus(401).json({ message: 'Invalid credentials' });
  }

  sendAuthentication(res, user);
};

const getAll = async (req, res) => {
  const users = await UsersServices.getAllActive();

  res.send(users.map(normalizeUser));
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);
  const user = await UsersServices.getByEmail(userData?.email || '');
  const token = await TokenServices.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData) {
    await TokenServices.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const authController = {
  register,
  activate,
  login,
  getAll,
  sendAuthentication,
  refresh,
  logout,
};

module.exports = {
  authController,
};
