function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

const validatePassword = value => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const validateConfirmationPassword = (confirmationPass, password) => {
  const validationMessage = validatePassword(confirmationPass);

  if (validationMessage) {
    return validationMessage;
  }

  if (password !== confirmationPass) {
    return `Confirmation password doesn't match new password`;
  }
};

export const validationService = {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmationPassword,
};
