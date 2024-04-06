const { Token } = require('../models/token.model.js');

const save = async ({ refreshToken, userId }) => {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refresh_token = refreshToken;
    await token.save();

    return;
  }

  await Token.create({ refresh_token: refreshToken, userId });
};

const remove = (userId) => {
  return Token.destroy({ where: { userId } });
};

const getByToken = (token) => {
  if (!token) {
    return null;
  }

  return Token.findOne({ where: { refresh_token: token } });
};

module.exports = {
  save,
  remove,
  getByToken,
};
