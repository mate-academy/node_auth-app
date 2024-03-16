const Token = require("../models/token");

const save = async (authId, newToken) => {
  const token = await Token.findOne({ where: { authId } });

  if (!token) {
    await Token.create({ authId, refreshToken: newToken });
    return;
  }

  token.refreshToken = newToken;
  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = (authId) => {
  return Token.destroy({ where: { authId } });
};

module.exports = { save, getByToken, remove };
