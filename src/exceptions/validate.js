'use strict';

function name(value) {
  if (!value) {
    return 'Name is required';
  }

  const namePattern = /^[a-zA-Z](?:[a-zA-Z ]{0,18}[a-zA-Z])?$/;

  if (!namePattern.test(value)) {
    return 'Name is invalid (only letters, the length from 2 to 20)';
  }

  return null;
}

function email(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is invalid';
  }

  return null;
}

function password(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  return null;
}

module.exports = {
  validate: {
    name,
    email,
    password,
  },
};
