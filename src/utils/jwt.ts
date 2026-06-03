import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from '../services/user.service.js';

const SECRET = process.env.JWT_ACCESS_SECRET as string;

function generateAccessToken(user: NormalizedUser) {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '10m' });
}

function validateAccessToken(token: string) {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

export const jwt = {
  generateAccessToken,
  validateAccessToken,
};

