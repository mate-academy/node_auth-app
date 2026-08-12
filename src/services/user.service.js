import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { randomUUID } from 'crypto';
import { bcrypt } from 'bcrypt';
import { emailService } from './email.service.js';
import { jwtService } from './jwt.service.js';
import { tokenService } from './token.service.js';

function normalizeUser({ id, email, isActivated }) {
  return { id, email, isActivated };
}

async function register({ name, email, password }) {
  const existEmail = await User.findOne({ where: { email } });

  if (existEmail) {
    throw ApiError.badRequest('Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const activationToken = randomUUID();

  const user = await User.create({
    email,
    password: passwordHash,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return normalizeUser(user);
}

async function active(activationToken) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.badRequest('Activation link is invalid');
  }

  user.activationToken = null;
  user.isActivated = true;

  await user.save();
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Account is not activated');
  }

  const userDto = normalizeUser(user);

  const accessToken = jwtService.sign(userDto);
  const refreshToken = jwtService.signRefresh(userDto);

  await tokenService.save(user.id, refreshToken);

  return {
    user: userDto,
    accessToken,
    refreshToken,
  };
}

async function updateProfile(userId, { name }) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  if (name) {
    user.name = name;
  }

  await user.save();

  return normalizeUser(user);
}

async function logout(userId) {
  await tokenService.remove(userId);
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const tokenFromDb = await tokenService.getByToken(refreshToken);

  if (!userData || !tokenFromDb) {
    throw ApiError.unauthorized();
  }

  const user = await User.findByPk(userData.id);
  const userDto = normalizeUser(user);

  const newAccessToken = jwtService.sign(userDto);
  const newRefreshToken = jwtService.signRefresh(userDto);

  await tokenService.save(user.id, newRefreshToken);

  return {
    user: userDto,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export const userService = {
  register,
  active,
  login,
  logout,
  updateProfile,
  refresh,
};
