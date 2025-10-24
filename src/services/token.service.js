/* eslint-disable no-console */
import { Token } from '../models/token.module.js';

export const tokenService = {
  async save(userId, newRefreshToken) {
    try {
      const existingToken = await Token.findOne({ where: { userId } });

      if (existingToken && existingToken.refreshToken === newRefreshToken) {
        console.log(
          'tokenService.save: token already exists, skipping save',
          userId,
          newRefreshToken.slice(0, 8),
          new Error().stack.split('\n')[2],
        );

        return existingToken;
      }

      if (existingToken) {
        existingToken.refreshToken = newRefreshToken;
        await existingToken.save();

        console.log(
          'tokenService.save: updated token',
          userId,
          newRefreshToken.slice(0, 8),
          new Error().stack.split('\n')[2],
        );

        return existingToken;
      } else {
        const token = await Token.create({
          userId,
          refreshToken: newRefreshToken,
        });

        console.log(
          'tokenService.save: created new token',
          userId,
          newRefreshToken.slice(0, 8),
          new Error().stack.split('\n')[2],
        );

        return token;
      }
    } catch (error) {
      console.error('tokenService.save: error', error);
      throw error;
    }
  },

  async remove(userId) {
    try {
      await Token.destroy({ where: { userId } });
      console.log('tokenService.remove: removed tokens for', userId);
    } catch (error) {
      console.error('tokenService.remove: error', error);
      throw error;
    }
  },

  async getByToken(refreshToken) {
    return Token.findOne({ where: { refreshToken } });
  },
};
