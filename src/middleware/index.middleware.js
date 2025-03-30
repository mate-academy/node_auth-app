import accessMiddleware from './access.middleware.js';
import authMiddleware from './auth.middleware.js';
import isUniqueFieldMiddleware from './isUniqueField.middleware.js';
import validationFieldMiddleware from './validationField.middleware.js';

const middlewares = {
  validationField: (model) => validationFieldMiddleware(model),
  isUniqueField: (schema) => isUniqueFieldMiddleware(schema),
  access: accessMiddleware,
  auth: authMiddleware,
};

export default middlewares;
