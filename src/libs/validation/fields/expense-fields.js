'use strict';

const joi = require('joi');

const userId = joi.number().integer();
const spentAt = joi.string().trim().isoDate();
const title = joi.string().trim();
const amount = joi.number().integer();
const category = joi.string().trim();
const note = joi.string().trim();

const expenseFields = {
  userId,
  spentAt,
  title,
  amount,
  category,
  note,
};

module.exports = {
  expenseFields,
};
