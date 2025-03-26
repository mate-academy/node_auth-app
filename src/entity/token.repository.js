import { Token } from '../models/Token.model.js';

const updateOrCreate = async ({ userId, newToken, type, expiresAt }) => {
  const token = await Token.findOne({ where: { userId, type } });

  if (!token) {
    await Token.create({
      userId,
      token: newToken,
      type,
      expiresAt,
    });

    return;
  }

  token.expiresAt = expiresAt;
  token.token = newToken;

  await token.save();
};

const getByToken = async (token) => {
  const existToken = await Token.findOne({ where: { token } });

  if (!existToken) {
    return null;
  }

  if (existToken.expiresAt < Date.now()) {
    await Token.destroy({ where: { token } });

    return null;
  }

  return existToken;
};

const deleteByUserId = async (userId, type = '') => {
  const whereCondition = { userId };

  if (type) {
    whereCondition.type = type;
  }
  await Token.destroy({ where: whereCondition });
};

const tokenRepository = {
  updateOrCreate,
  getByToken,
  deleteByUserId,
};

export default tokenRepository;
