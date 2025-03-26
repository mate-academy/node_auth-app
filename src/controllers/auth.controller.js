// @ts-nocheck
import { getUserByEmail, normalize } from '../services/user.services.js';
import bcrypt from 'bcrypt';
import {
  activateUser,
  createUser,
  resetPassword,
  sendResetUserPassword,
} from '../services/auth.services.js';
import { sign, signRefresh, verifyRefresh } from '../services/jwt.services.js';
import { ApiError } from '../exeptions/api.error.js';
import { validateNewPassword, validateUserData } from '../utils/validator.js';
import { getByToken, remove, save } from '../services/token.services.js';

export const registration = async (req, res) => {
  const { email, password, name } = req.body;
  const notValid = validateUserData({ email, password });

  if (notValid) {
    throw new ApiError({
      messsage: 'Invalid entry',
      status: 422,
      errors: notValid,
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await createUser(email, hashedPass, name);

  res.send({ message: 'OK' });
};

export const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = activateUser(activationToken);

  if (!user) {
    throw ApiError.notFound();
  }

  res.send(normalize(user));
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.wrongPassword();
  }

  if (user.activationToken) {
    throw ApiError.unactivated();
  }

  generateToken(res, user);
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }
  await remove(userData.id);

  res.sendStatus(204);
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await verifyRefresh(refreshToken);
  const token = await getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await getUserByEmail(userData.email);

  generateToken(res, user);
};

export const sendResetPassword = async (req, res) => {
  const { email } = req.body;

  sendResetUserPassword(email);

  res.send({ message: 'OK' });
};

export const resetUserPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;
  const validPasswords = validateNewPassword({ password, confirmPassword });

  if (validPasswords) {
    throw ApiError.badRequest('Invalid password', validPasswords);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await resetPassword(hashedPass, resetToken);

  res.send({ message: 'Succesfully changed password' });
};

const generateToken = async (res, user) => {
  const normalizedUser = normalize(user);
  const accessToken = sign(normalizedUser);
  const refreshToken = signRefresh(normalizedUser);

  await save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, { maxAge: 30000, HttpOnly: true });

  res.send({
    user: normalizedUser,
    accessToken: accessToken,
  });
};
