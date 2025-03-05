'use strict';

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  // eslint-disable-next-line
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

module.exports = {
  validateEmail,
  validatePassword
};