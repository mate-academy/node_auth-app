import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
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

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPass, name);
  res.send({ message: 'ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }
  user.activationToken = null;
  await user.save();

  res.send(user);
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
  generateToken(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);

  generateToken(res, user);
};

const generateToken = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({ user: normalizedUser, accessToken });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

async function reqPwdReset(req, res) {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  const errors = {
    email:
      validateEmail(email) ||
      (!user ? 'Email not found' : undefined) ||
      (user.activationToken ? 'User not activated' : undefined),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.reqPwdReset(email);
  res.send({ message: 'OK' });
}

async function validatePwResetToken(req, res) {
  const { pwdResetToken } = req.params;
  const user = await User.findOne({ where: { pwdResetToken } });

  const errors = {
    token:
      (!user ? 'invalid token' : undefined) ||
      (!pwdResetToken ? 'token required' : undefined),
  };

  if (errors.token) {
    throw ApiError.badRequest('Bad request', errors);
  }

  res.send({ message: 'OK' });
}

async function pwdReset(req, res) {
  const { pwdResetToken } = req.params;
  const { password, confirmPassword } = req.body;
  const user = await User.findOne({ where: { pwdResetToken } });

  const errors = {
    password:
      validatePassword(password) ||
      (confirmPassword !== password ? 'Passwords do not match' : undefined),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.pwdResetToken = null;
  await user.save();

  res.sendStatus(204);
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  reqPwdReset,
  validatePwResetToken,
  pwdReset,
  validateEmail,
  validatePassword,
};
