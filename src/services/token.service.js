import 'dotenv/config';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { Token } from '../models/index.js';
import { hashToken } from '../utils/hashToken.js';
import { TOKEN_TYPES } from '../constants/token.constant.js';
import { AppError } from '../core/AppError.js';

const saveToken = async (userId, token, type, expiresIn) => {
  const expiresInMs = ms(expiresIn);

  return Token.create({
    userId,
    token,
    type,
    expiresAt: new Date(Date.now() + expiresInMs),
  });
};

const generateAccessToken = (payload) => {
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SIGNATURE, {
    expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
  });

  return token;
};

const generateAndSaveRefreshToken = async (payload) => {
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SIGNATURE, {
    expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
  });

  await saveToken(
    payload.userId,
    token,
    TOKEN_TYPES.REFRESH,
    process.env.EXPIRES_IN_REFRESH_TOKEN,
  );

  return token;
};

const generateEmailChangeToken = (payload) => {
  const token = jwt.sign(payload, process.env.EMAIL_CHANGE_TOKEN_SIGNATURE, {
    expiresIn: process.env.EXPIRES_IN_EMAIL_CHANGE_TOKEN,
  });

  return token;
};

const verifyEmailChangeToken = (token) => {
  try {
    return jwt.verify(token, process.env.EMAIL_CHANGE_TOKEN_SIGNATURE);
  } catch (error) {
    throw new AppError('Invalid or expired token.', 400);
  }
};

const deleteToken = async (token, type) => {
  return Token.destroy({
    where: { token: hashToken(token), type },
  });
};

const deleteTokenByUserId = async (userId, type) => {
  return Token.destroy({
    where: { userId, type },
  });
};

const findToken = async (token, type) => {
  return Token.findOne({
    where: { token: hashToken(token), type },
  });
};

export {
  findToken,
  saveToken,
  deleteToken,
  deleteTokenByUserId,
  verifyEmailChangeToken,
  generateAndSaveRefreshToken,
  generateEmailChangeToken,
  generateAccessToken,
};
