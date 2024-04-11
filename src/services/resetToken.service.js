const { ResetToken } = require('../models/resetToken.model.js');

const save = async ({ resetToken, userId }) => {
  const token = await ResetToken.findOne({ where: { userId } });

  if (token) {
    token.reset_token = resetToken;
    await token.save();

    return;
  }

  await ResetToken.create({ reset_token: resetToken, userId });
};

const remove = async (userId) => {
  await ResetToken.destroy({ where: { userId } });
};

module.exports = {
  save,
  remove,
};
