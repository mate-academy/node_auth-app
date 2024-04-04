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

const remove = async (userId) => {
  await Token.destroy({ where: { userId } });
};

module.exports = {
  save,
  remove,
};
