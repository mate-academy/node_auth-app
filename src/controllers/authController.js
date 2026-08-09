import { ApiError } from '../exeptions/ApiError.js';
import { User } from '../models/User.js';
import { emailService } from '../services/emailService.js';
import { jwtService } from '../services/jwtService.js';
import { tokenService } from '../services/tokenService.js';
import { userService } from '../services/userService.js';
import bcrypt from 'bcrypt';

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

async function register(req, res, next) {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: emailService.validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register(name, email, password);

  res.send({ message: 'OK' });
}

async function activate(req, res, next) {
  const { activationToken } = req.body;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function forgotPassword(req, res, next) {
  const { email } = req.body;

  await userService.forgotPassword(email);

  res.send({ message: 'OK' });
}

async function login(req, res, next) {
  const { name, email, password } = req.body;
  const user = userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  if (user.name !== name) {
    throw ApiError.BadRequest('Name is wrong');
  }

  if (user.activationToken !== null) {
    throw ApiError.Unauthorized();
  }

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

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

async function resetPassword(req, res, next) {
  const { email, password, confirmPassword } = req.body;
  const user = userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  if (password !== confirmPassword) {
    throw ApiError.BadRequest('Passwords should be equal');
  }

  await userService.resetPassword(email, password);

  res.redirect('/success');
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

  res
    .send({
      user: userData,
      accessToken,
    })
    .redirect('/profile');
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
