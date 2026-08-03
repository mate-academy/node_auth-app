import bcrypt from 'bcrypt';

import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { ApiError } from '../exeptions/api.error.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  return null;
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: !name?.trim() ? 'Name is required' : undefined,
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name.trim(), email, hashedPass);

  res.status(201).send({
    message:
      'Registration successful. Check your email to activate the account.',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    throw ApiError.badRequest(
      'Activation link is invalid or has already been used',
    );
  }

  user.activationToken = null;

  await user.save();

  res.send({
    message: 'Account activated successfully',
    user: userService.normalize(user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    throw ApiError.badRequest('Bad request', {
      email: emailError,
      password: passwordError,
    });
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Account is not activated', {
      email: 'Please activate your account using the link sent to your email',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  const savedToken = await tokenService.getByToken(refreshToken);

  if (!savedToken) {
    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);

  if (!user) {
    await tokenService.remove(userData.id);

    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  if (user.activationToken) {
    await tokenService.remove(user.id);

    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);

  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie('refreshToken', getRefreshCookieOptions());

  if (!userData) {
    throw ApiError.unauthorized();
  }

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
