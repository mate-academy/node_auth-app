const yup = require('yup');

const email = yup
  .string()
  .email('Invalid email address')
  .required('Email is required');

module.exports = {
  email,
};
