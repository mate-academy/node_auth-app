const EmailValidator = require('email-validator');
const PasswordValidator = require('password-validator');

const {
  EMAIL_REQUIRED,
  PASSWORD_REQUIRED,
  NAME_REQUIRED,
} = require('../const/errors');

const validateEmail = (value) => {
  if (!value) {
    return EMAIL_REQUIRED;
  }

  const isEmail = EmailValidator.validate(value);

  if (!isEmail) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return PASSWORD_REQUIRED;
  }

  const schema = new PasswordValidator();

  schema.is().min(6);

  const isValid = schema.validate(value);

  if (!isValid) {
    return 'Min password length is 6 characters';
  }
};

const validateName = (name) => {
  if (!name) {
    return NAME_REQUIRED;
  }

  const normalizedName = name.trim();

  if (normalizedName.length < 2 || normalizedName.length > 20) {
    return 'Name should contain from 2 to 20 characters';
  }
};

module.exports = {
  ValidatorHelper: {
    validateEmail,
    validatePassword,
    validateName,
  },
};
