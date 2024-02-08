'use strict';

function validateUsername(value) {
  if (value.length < 3) {
    return 'Enter a bit longer username';
  }
};

function validateConfirmPassword(newPassword, confirmationPassword) {
  if (newPassword !== confirmationPassword) {
    return 'Wrong confirmation password';
  }
};

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

module.exports = {
  validateUsername,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
};
