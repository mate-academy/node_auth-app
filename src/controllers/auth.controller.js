import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { userService } from '../services/user.service.js';
import { tokenService } from '../services/token.service.js';
import bcrypt from 'bcrypt';

const register = async (req, res, next) => {
  const { email, password } = req.body;

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPass);

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

async function generateTokens(res, user) {
  // normalized to transfer only id and email
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  // save or create a new refresh token in db
  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    // 7 days in ms
    maxAge: 7 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user', {
      email: 'No such user',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      password: 'Wrong password',
    });
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  // checks validity of refresh token
  const userData = jwtService.verifyRefresh(refreshToken);
  // checks for refresh token in db
  const token = await tokenService.getByToken(refreshToken);

  if (!token || !userData) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, userData);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
};
