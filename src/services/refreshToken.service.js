import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../models/refreshToken.js';

export const createRefreshToken = async (userId) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const result = await RefreshToken.create({ token, userId, expiresAt });

  return result.token;
};
