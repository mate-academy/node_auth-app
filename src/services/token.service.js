const { Token } = require('../models/token.model.js');

const save = async (userId, newToken, type) => {
  const token = await Token.findOne({
    where: { userId },
  });

  if (token) {
    token[type] = newToken;
    await token.save();

    return;
  }

  await Token.create({ userId, [type]: newToken });
};

const findByToken = (type, token) => {
  return Token.findOne({
    where: { [type]: token },
  });
};

const removeToken = (userId) => {
  return Token.destroy({
    where: { userId },
  });
};

module.exports = {
  findByToken,
  save,
  removeToken,
};
