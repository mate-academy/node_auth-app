const bcrypt = require('bcrypt');

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
    return 'Should be at least 6 characters';
  }
}

function validateName(value) {
  if (value.length < 3) {
    return 'Should be at least 3 characters';
  }
}

function hashPassword(password, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds);
}

const comparePasswords = (plainPWD, userPWDHash) => {
  return bcrypt.compare(plainPWD, userPWDHash);
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  hashPassword,
  comparePasswords,
};
