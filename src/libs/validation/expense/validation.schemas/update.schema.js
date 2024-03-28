'use strict';

const joi = require('joi');

const { expenseFields } = require('../../fields/expense-fields.js');

const {
  spentAt,
  title,
  amount,
  category,
  note,
} = expenseFields;

const updateSchema = joi
  .object({
    spentAt,
    title,
    amount,
    category,
    note,
  })
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  updateSchema,
};
