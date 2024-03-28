'use strict';

const { bodyValidation } = require('../../middlewares/middlewares.js');
const { createSchema } = require('./validation.schemas/create.schema.js');
const { updateSchema } = require('./validation.schemas/update.schema.js');

const createValidation = bodyValidation(createSchema);
const updateValidation = bodyValidation(updateSchema);

module.exports = {
  createValidation,
  updateValidation,
};
