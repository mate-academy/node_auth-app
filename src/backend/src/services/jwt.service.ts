import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { PublicUser } from './user.service.js';

function sign(user: PublicUser) {
  const secret = process.env.JWT_KEY;
  if (!secret) {
    throw new Error('JWT_KEY is not defined in environment variables!');
  }
  const token = jwt.sign(user, secret, {
    expiresIn: '20m',
  });

  return token;
}

function verify(token: string) {
  const secret = process.env.JWT_KEY;
  if (!secret) {
    throw new Error('JWT_KEY is not defined in environment variables!');
  }
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.log(error);
    return null;
  }
}

function signRefresh(user: PublicUser) {
  const secret = process.env.JWT_REFRESH_KEY;
  if (!secret) {
    throw new Error('JWT_REFRESH_KEY is not defined in environment variables!');
  }
  const token = jwt.sign(user, secret, {
    expiresIn: '30d',
  });

  return token;
}

function verifyRefresh(token: string) {
  const secret = process.env.JWT_REFRESH_KEY;
  if (!secret) {
    throw new Error('JWT_REFRESH_KEY is not defined in environment variables!');
  }
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
