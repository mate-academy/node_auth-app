import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);
  setRefreshCookie(res, refreshToken);

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

function validateEmail(value) {
  if (!value) {
    return 'Email is required!';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required!';
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordPattern.test(value)) {
    return 'Password must be at least 8 characters long and include an uppercase letter and a number';
  }
}

function validateName(value) {
  if (!value || !value.trim()) {
    return 'Name is required!';
  }
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);
  await userService.register(name.trim(), email, hashedPass);
  res.send({ message: 'Ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.query;

  if (!activationToken) {
    throw ApiError.badRequest('Activation token is required');
  }

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  await user.save();

  // Log the user in automatically right after activation.
  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.forbidden(
      'Please activate your account. Check your email for the activation link.',
    );
  }

  await generateTokens(res, user);
};

const getProfile = async (req, res) => {
  const user = await userService.findById(req.user.id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  res.send(userService.normalize(user));
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = refreshToken ? jwtService.verifyRefresh(refreshToken) : null;
  const token = refreshToken
    ? await tokenService.getByToken(refreshToken)
    : null;

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = refreshToken ? jwtService.verifyRefresh(refreshToken) : null;

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);
  res.clearCookie('refreshToken');

  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (validateEmail(email)) {
    throw ApiError.badRequest('Bad request', { email: 'Email is not valid' });
  }

  await userService.requestPasswordReset(email);

  // Always respond OK — never reveal whether the email exists.
  res.send({ message: 'Ok' });
};

const resetPasswordSave = async (req, res) => {
  const { token, password } = req.body;

  const passwordError = validatePassword(password);

  if (!token || passwordError) {
    throw ApiError.badRequest('Bad request', {
      token: !token ? 'Token is required' : undefined,
      password: passwordError,
    });
  }

  await userService.resetPassword(token, password);

  res.send({ message: 'Ok' });
};

export const authController = {
  register,
  activate,
  login,
  getProfile,
  refresh,
  logout,
  forgotPassword,
  resetPasswordSave,
};
