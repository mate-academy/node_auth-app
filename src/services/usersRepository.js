const User = require('../models/User');

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function activate(email) {
  return User.update({
    where: { email },
    data: { activationToken: null },
  });
}

module.exports = {
  activate,
  getByEmail,
  validateEmail,
  validatePassword,
};
