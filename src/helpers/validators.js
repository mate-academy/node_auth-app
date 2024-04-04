const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');

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
  if (!password) {
    return 'Password is required';
  }

  const schema = new passwordValidator();

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

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
};
