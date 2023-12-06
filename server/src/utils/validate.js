'use strict';

const password = (password) => {

  if (password.length < 6) {
    return false
  }

  return true;
}
const name = (name) => {

  if (!name || name.length < 2) {
    return false
  }

  return true;
}

const email = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email || !emailPattern.test(email)) {
    return false
  }

  return true;
}

export const validate = {
  email,
  password,
  name,
};
