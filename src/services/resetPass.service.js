const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');
const { mailService } = require('./mail.service.js');

async function resetPass(email) {
  const resetToken = uuidv4();

  await User.update({ resetToken: resetToken }, { where: { email } });
  await mailService.sendResetPassEmail(email, resetToken);
}

exports.resetPassService = {
  resetPass,
};
