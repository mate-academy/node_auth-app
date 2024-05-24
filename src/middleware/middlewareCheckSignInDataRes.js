'use strict';

const { ApiError } = require('../exeptions/api.error.js');
const { isValidatedEmail } = require('../utils/isValidatedEmail.js');
const { isValidatedPassword } = require('../utils/isValidatedPassword.js');

function middlewareCheckSignInDataRes(req, res, next) {
  const { name, email, password } = req.body;

  if (!email) {
    throw ApiError.badRequest({ message: 'Please enter email' });
  }

  if (!name) {
    throw ApiError.badRequest({ message: 'Please enter name' });
  }

  if (!password) {
    throw ApiError.badRequest({ message: 'Please enter password' });
  }

  if (name.trim() === '') {
    throw ApiError.badRequest({ message: 'Please enter correct name' });
  }

  if (!isValidatedEmail(email)) {
    throw ApiError.badRequest({ message: 'Please enter correct email' });
  }

  if (!isValidatedPassword(password)) {
    throw ApiError.badRequest({ message: 'Please enter correct password' });
  }

  next();
}

module.exports = {
  middlewareCheckSignInDataRes,
};
