import { Token } from '../models/token.js';

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;
  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

async function remove(userId) {
  try {
    const token = await Token.findOne({ where: { userId } });

    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    await Token.destroy({ where: { userId } });

    return { success: true, message: 'Token removed successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to remove token' };
  }
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
