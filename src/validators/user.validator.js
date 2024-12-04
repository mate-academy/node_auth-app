import { checkSchema } from 'express-validator';

import * as validationTypes from '../utils/validationTypes.js';

export const changeName = checkSchema(
  {
    name: validationTypes.name,
  },
  ['body'],
);

export const changeEmail = checkSchema(
  {
    password: validationTypes.password,
    newEmail: { isEmail: true },
  },
  ['body'],
);

export const activateNewEmail = checkSchema(
  {
    activationNewEmailToken: { isUUID: true },
  },
  ['params'],
);

export const changePassword = checkSchema(
  {
    password: validationTypes.password,
    newPassword: validationTypes.password,
  },
  ['body'],
);
