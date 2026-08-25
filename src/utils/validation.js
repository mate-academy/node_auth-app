'use strict';

const { ApiError } = require('./ApiError.js');

function assertValid(errors) {
  if (Object.values(errors).some(Boolean)) {
    throw ApiError.badRequest('Validation error', errors);
  }
}

module.exports = { assertValid };
