import crypto from 'node:crypto';

const TOKEN_LENGTH = 32;

export const generateToken = (): string => {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
};
