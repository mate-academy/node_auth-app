'use strict';

function email(value) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  return emailPattern.test(value);
}

function password(value) {
  return value.length > 5;
}

const validation = {
  email,
  password,
};

module.exports = validation;
