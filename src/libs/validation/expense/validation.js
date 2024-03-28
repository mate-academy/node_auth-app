'use strict';

const {
  bodyValidation, queryValidation,
} = require('../../middlewares/middlewares.js');
const { createSchema } = require('./validation.schemas/create.schema.js');
const { updateSchema } = require('./validation.schemas/update.schema.js');
const { querySchema } = require('./validation.schemas/query.schema.js');

const createValidation = bodyValidation(createSchema);
const updateValidation = bodyValidation(updateSchema);
const filtersValidation = queryValidation(querySchema);

module.exports = {
  createValidation,
  updateValidation,
  filtersValidation,
};
