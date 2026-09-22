import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from '../services/user.service';

const SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const generateAccessToken = (user: NormalizedUser) => {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '10m' });
};

const validateAccessToken = (token: string) => {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};

const generateRefreshToken = (user: NormalizedUser) => {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
};

const validateRefreshToken = (token: string) => {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

export const jwt = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
