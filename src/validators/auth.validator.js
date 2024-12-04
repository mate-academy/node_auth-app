import { checkSchema } from 'express-validator';

import * as validationTypes from '../utils/validationTypes.js';

export const login = checkSchema(
  {
    email: { isEmail: true },
    password: validationTypes.password,
  },
  ['body'],
);

export const register = checkSchema(
  {
    email: { isEmail: true },
    password: validationTypes.password,
    name: validationTypes.name,
  },
  ['body'],
);

export const activate = checkSchema(
  {
    activationToken: { isUUID: true },
  },
  ['params'],
);

export const resetPassword = checkSchema(
  {
    email: { isEmail: true },
  },
  ['body'],
);

export const setNewPassword = checkSchema(
  {
    resetPasswordToken: { isUUID: true },
    password: validationTypes.password,
  },
  ['params', 'body'],
);
