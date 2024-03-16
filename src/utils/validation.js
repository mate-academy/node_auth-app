'use strict';

const validateUsername = (username) => {
  const pattern = /^[a-zA-Z0-9_]{6,12}$/;

  return username && typeof username === 'string' && pattern.test(username);
};

const validateEmail = (email) => {
  const pattern = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

  return email && typeof email === 'string' && pattern.test(email);
};

const validatePassword = (password) => {
  // eslint-disable-next-line max-len
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;

  return password && typeof password === 'string' && pattern.test(password);
};

const validateExpensePatchRequestBody = (
  { id, spentAt, title, amount, category, note }
) => {
  return (spentAt
    ? (typeof spentAt === 'string' && !isNaN(new Date(spentAt)))
    : true)
    && (title ? typeof title === 'string' : true)
    && (amount ? Number.isInteger(amount) : true)
    && (category ? typeof category === 'string' : true)
    && (note ? typeof note === 'string' : true);
};

const validateExpensePostRequestBody = (
  { spentAt, title, amount, category, note }
) => {
  return (typeof spentAt === 'string' && !isNaN(new Date(spentAt)))
    && typeof title === 'string'
    && Number.isInteger(amount)
    && typeof category === 'string'
    && (note ? typeof note === 'string' : true);
};

module.exports = {
  validateUsername,
  validateEmail,
  validatePassword,
  validateExpensePatchRequestBody,
  validateExpensePostRequestBody,
};
