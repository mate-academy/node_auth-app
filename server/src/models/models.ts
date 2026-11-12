'use strict';

import { User } from './User.model.js';
import { Expense } from './Expense.model.js';
import { RefreshToken } from './RefreshToken.model.js';
import { ResetPasswordToken } from './PasswordResetToken.model.js';

export const models = {
  User,
  Expense,
  RefreshToken,
  ResetPasswordToken,
};
