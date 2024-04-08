const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const { ApiError } = require('../exeptions/apiError');

const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const isEmail = emailValidator.validate(email);

  if (!isEmail) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  console.log(password);

  if (!password) {
    return 'Password is required';
  }

  const schema = new PasswordValidator();

  schema.is().min(4);

  const isValid = schema.validate(password);

  if (!isValid) {
    return 'Password must contain at least 4 characters';
  }
};

const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }

  const normalizedName = name.trim();

  if (normalizedName.length < 2 || normalizedName.length > 20) {
    return 'Name should be between 2 and 20 characters';
  }
};

const comparePassword = (password1, password2) => {
  const error = {
    newPassword: validatePassword(password1),
    newPasswordCopy: validatePassword(password2),
    isEqual: password1 === password2 ? null : 'Passwords do not match.',
  };

  if (error.password1 || error.password2 || error.isEqual) {
    throw ApiError.badRequest('Wrong passwods', error);
  }
};

module.exports = {
  validateName,
  validateEmail,
  comparePassword,
  validatePassword,
};
