const { User } = require('../models/user');
const { mailService } = require('./mail.service.js');

async function register(name, email, hashedPassword, activationToken) {
  await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await mailService.sendActivationEmail(email, activationToken);
}

exports.userService = {
  register,
};
