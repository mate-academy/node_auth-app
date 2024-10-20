import { Token } from '../models/token.js';

const save = async (userId, refreshToken) => {
  const token = await Token.findOne({ where: userId });

  if (token) {
    token.refreshToken = refreshToken;
    await token.save();

    return;
  }

  await Token.create({ userId, refreshToken });
};

const saveResetToken = async (userId, resetToken) => {
  const token = await Token.findOne({ where: userId });

  if (token) {
    await token.update({
      resetToken,
    });
    return;
  }

  await Token.create({ userId, resetToken });
};

const getByResetToken = async (resetToken) => {
  return Token.findOne({
    where: {
      resetToken,
    },
  });
};

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

export const tokenService = {
  save,
  getByToken,
  remove,
  saveResetToken,
  getByResetToken,
};
