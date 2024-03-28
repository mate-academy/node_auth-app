'use strict';

const { authMiddleware } = require('./auth.middleware.js');
const {
  bodyValidation, queryValidation,
} = require('./validation.middleware.js');
const { catchError } = require('./catch-error.middleware.js');
const { errorMiddleware } = require('./error.middleware.js');
const { rolePermissionMiddleware } = require('./role-permission.middleware.js');

module.exports = {
  authMiddleware,
  catchError,
  bodyValidation,
  queryValidation,
  errorMiddleware,
  rolePermissionMiddleware,
};
