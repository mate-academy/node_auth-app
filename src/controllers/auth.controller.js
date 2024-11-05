import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

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

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (!passwordPattern.test(value)) {
    return 'Password must contain at least one letter and one number';
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

  await userService.register(email, hashedPass);

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
      validateEmail(email) ||
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

export const authController = {
  register,
  activate,
  login,
  refresh,
};
