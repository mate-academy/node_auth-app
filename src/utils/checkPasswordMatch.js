import * as validation from './validators.js';

export const checkPasswordMatch = (password, confirmation) => {
  const validatorMessage = validation.validatePassword(password);

  if (validatorMessage) {
    return validatorMessage;
  }

  if (confirmation !== password) {
    return 'Passwords do not match';
  }

  return null;
};
