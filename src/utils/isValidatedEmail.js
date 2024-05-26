'use strict';

const isValidatedEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

module.exports = {
  isValidatedEmail,
};
