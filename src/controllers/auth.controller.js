import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: authService.validateEmail(email),
    password: authService.validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPass, name);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  const errors = {
    token: !user ? 'invalid token' : undefined,
  };

  if (errors.token) {
    throw ApiError.notFound({ errors });
  }

  user.activationToken = null;
  user.save();

  res.send(userService.normalize(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  const errors = {
    email:
      authService.validateEmail(email) ||
      (!user ? 'User not found' : undefined) ||
      (user.activationToken ? 'User not activated' : undefined),
    password: user
      ? !isPasswordValid
        ? 'Invalid password'
        : undefined
      : undefined,
  };

  if (errors.email || errors.password) {
    throw ApiError.unauthorized({ errors });
  }

  generateTokens(res, user);
};

async function refresh(req, res) {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
}

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  const errors = {
    isLoggedIn: !refreshToken ? 'User not logged in' : undefined,
  };

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized({ errors });
  }

  tokenService.remove(userData.id);

  res.sendStatus(204);
}

async function reqPwdReset(req, res) {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  const errors = {
    email:
      authService.validateEmail(email) ||
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

  if (errors.pwdResetToken) {
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
      authService.validatePassword(password) ||
      (confirmPassword !== password ? 'Passwords do not match' : undefined),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.pwdResetToken = null;
  user.save();

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
};
