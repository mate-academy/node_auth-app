'use strict';

const joi = require('joi');

const { expenseFields } = require('../../fields/expense-fields.js');

const {
  userId,
  spentAt,
  title,
  amount,
  category,
  note,
} = expenseFields;

const createSchema = joi
  .object({
    userId: userId.required(),
    spentAt: spentAt.required(),
    title: title.required(),
    amount: amount.required(),
    category,
    note,
  })
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  createSchema,
};
