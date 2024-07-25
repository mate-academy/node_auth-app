/* eslint-disable no-console */
const { PasswordToken } = require('../models/password.model.js');

async function save(userId, newToken) {
  const token = await PasswordToken.findOne({ where: { userId } });

  console.log('token', token);

  if (!token) {
    await PasswordToken.create({ userId, passwordToken: newToken });

    return;
  }

  console.log('newToken', newToken);

  token.passwordToken = newToken;
  await token.save();
}

function getByToken(passwordToken) {
  return PasswordToken.findOne({ where: { passwordToken } });
}

function remove(userId) {
  return PasswordToken.destroy({ where: { userId } });
}

module.exports = {
  save,
  getByToken,
  remove,
};
