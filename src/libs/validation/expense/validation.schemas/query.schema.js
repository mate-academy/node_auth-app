'use strict';

const joi = require('joi');

const { expenseFields } = require('../../fields/expense-fields.js');

const {
  userId,
  spentAt,
} = expenseFields;

const querySchema = joi
  .object({
    userId,
    categories: joi.array().items(joi.string().trim()).single(),
    from: spentAt,
    to: spentAt,
  })
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  querySchema,
};
