const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');
const { mailService } = require('./mail.service.js');

const changeMail = async (user, newEmail) => {
  const resetToken = uuidv4();

  await User.update(
    { resetToken: resetToken },
    { where: { email: user.email } },
  );
  await mailService.sendResetEmailEmail(newEmail, resetToken);
};

const applyNewMail = async (user, newEmail) => {
  await mailService.sendWarningEmail(user.email);

  user.email = newEmail;
  user.resetToken = null;
  await user.save();
};

exports.profileService = {
  changeMail,
  applyNewMail,
};
