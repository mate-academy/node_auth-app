import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

import { userService } from '../services/userServices.js';
import { jwtService } from '../services/jwtService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { tokenService } from '../services/tokenService.js';

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
};

async function register(req, res, next) {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  }

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({ email, password, name })

  res.send({ message: 'OK' });
};

const registerWithGoogle = async(req, res, next) => {
  const { email, name, id } = req.body;
  const errors = {
    email: validateEmai(email),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }
  await userService.registerWithGoogle(email, id, name);

  const user = await userService.getByEmail(email);

  await sendAuthentication(res, user);
};

async function activate(req, res, next) {
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

  // res.send(user);
  await sendAuthentication(res, user)
};

async function login(req, res, next) {
  const { email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, user);
};

async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;

  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id)
  }

  res.sendStatus(204);
}

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);
  
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: none,
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

const restorePasswordEmailPart = async(req, res, next) => {
  const { email } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  user.restoreCode = userService.generateRestoreCode();
  await user.save();
  await emailService.sendRestoreCode(email, user.restoreCode);

  res.send({ message: 'OK' });
};

const checkRestoreCode = async(req, res, next) => {
  const { restoreCode } = req.body;

  if (!restoreCode) {
    throw ApiError.BadRequest('Restore code was not provided');
  }

  const user = await User.findOne({
    where: { restoreCode },
  });

  if (!user) {
    throw ApiError.BadRequest('Restore Code is incorrect');
  }

  user.restoreCode = null;
  await user.save();

  res.send({ message: 'Code was accepted' });
};

const changePassword = async(req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (user) {
    const newPasswordHash = await bcrypt.hash(password, 10);

    user.password = newPasswordHash;
    await user.save();

    res.send({ message: 'Password updated successfully.' });
  } else {
    res.sendStatus(402);
  }
};

export const authConroller = {
  register,
  registerWithGoogle,
  activate,
  login,
  logout,
  refresh,
  restorePasswordEmailPart,
  checkRestoreCode,
  changePassword,
};
