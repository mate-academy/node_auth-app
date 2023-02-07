'use strict';

const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'Ate least 3 characters';
  }
};

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

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

const validatePasswordsMatching = (password, passwordConfirmation) => {
  if (!password || !passwordConfirmation) {
    return 'Password is required';
  }

  if (password !== passwordConfirmation) {
    return 'Passwords should bew equals';
  }
};

export default {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordsMatching,
};
