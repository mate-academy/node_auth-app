'use strict';

const validatePassword = (providedPassword) => {
  if (!providedPassword) {
    return 'Please provide password!';
  }

  if (providedPassword.length < 6) {
    return 'Password is too short!';
  }
};

const validateEmail = (providedEmail) => {
  if (!providedEmail) {
    return 'Please provide email!';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(providedEmail)) {
    return 'Please provide valid email!';
  }
};

const validateName = (providedName) => {
  if (!providedName) {
    return 'Please provide name!';
  }

  if (typeof providedName !== 'string') {
    return 'Please provide valid name!';
  }
};

exports.validators = {
  validateEmail,
  validatePassword,
  validateName,
};
