'use strict';

const bcrypt = require('bcrypt');

function email(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

function password(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  if (/^\s*$/.test(value)) {
    return 'Password cannot consist of only spaces';
  }
};

async function newPassword(pas, newPas, confirmation) {
  if (!newPas || !confirmation) {
    return 'Password and confirmation are required';
  }

  if (newPas.length < 6) {
    return 'New password should be at least 6 characters long';
  }

  const isNewPassword = await bcrypt.compare(newPas, pas);

  if (isNewPassword) {
    return 'New password is the same as the current password';
  }

  if (newPas !== confirmation) {
    return 'Confirmation does not match the new password';
  }

  if (/^\s*$/.test(newPas)) {
    return 'Password cannot consist of only spaces';
  }

  return null;
};

function username(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'At least 3 characters';
  }
};

module.exports = {
  email,
  newPassword,
  password,
  username,
};
