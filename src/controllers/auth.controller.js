import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

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

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    res.send('bad request, wrong validation');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.registerUser(name, email, hashedPassword);

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
  const user = await userService.getByEmail(email);

  if (!user) {
    res.statusCode = 404;
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.statusCode = 404;
    return;
  }

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    res.send('Not authorized');
    return;
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    res.send('Not authorized');
    return;
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
};

const sendAuthentication = async (res, user) => {
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
};

export const authController = {
  register,
  activate,
  login,
  sendAuthentication,
  refresh,
};
