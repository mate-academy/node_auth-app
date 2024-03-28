'use strict';

const { ErrorMessages } = require('../enums/enums.js');
const { ApiError } = require('../exceptions/api-error.js');

const paramsTypes = {
  body: 'body',
  query: 'query',
};

const validateRequest = (schema, paramsType) => {
  return async(req, res, next) => {
    try {
      const reqData = req[paramsType];
      const data = await schema.validateAsync(reqData);

      req[paramsType] = data;

      next();
    } catch (error) {
      const { details } = error;

      const errors = {};

      details.forEach((detail) => {
        const fieldName = detail.path[0];

        errors[fieldName] = detail.message || '';
      });

      throw ApiError.BadRequest(ErrorMessages.VALIDATION, errors);
    }
  };
};

const bodyValidation = (schema) => validateRequest(schema, paramsTypes.body);
const queryValidation = (schema) => validateRequest(schema, paramsTypes.query);

module.exports = {
  bodyValidation,
  queryValidation,
};
