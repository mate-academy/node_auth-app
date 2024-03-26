import Validator from '../../core/modules/validation/Validator.js';
import type { FilterKey } from '../../core/modules/validation/Validator.types.js';
import type User from './User.model.js';
import type { UserDTO } from './User.types.js';

export const allowedKeysToUpdate: Array<FilterKey<UserDTO>> = [
  { key: 'name', errMessage: 'Name must be a string', isValid: Validator.isNotEmptyString },
  { key: 'email', errMessage: 'Email is not valid', isValid: Validator.isEmail },
  {
    key: 'password',
    errMessage: 'Password length must be greater than 8',
    isValid: Validator.isStrongPassword,
  },
];

export interface EmailUpdateConfirmationParams {
  userId: User['id'];
  oldEmail: User['email'];
  newEmail: User['email'];
  codeForOldEmail: string;
  codeForNewEmail: string;
}
