import TokensSchema from '../model/tokens.js';

const save = async ({ userId, newToken }) => {
  const token = await TokensSchema.findOne({ where: { userId } });

  if (!token) {
    await TokensSchema.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;
  await token.save();
};

const deleteToken = (userId) => {
  return TokensSchema.destroy({ where: { userId } });
};

const getByToken = (refreshToken) => {
  return TokensSchema.findOne({ where: { refreshToken } });
};

export const tokensService = {
  save,
  deleteToken,
  getByToken,
};
