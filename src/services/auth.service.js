import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePasswords(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function generateActivationToken() {
  return uuidv4();
}

function createAccessToken(data) {
  return jwt.sign(data, process.env.JWT_SECRET);
}

export const authService = {
  hashPassword,
  comparePasswords,
  generateActivationToken,
  createAccessToken,
};
