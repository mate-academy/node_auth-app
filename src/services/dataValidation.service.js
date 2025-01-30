const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 2) {
    return 'Name should consist at least 2 characters';
  }
};

const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

export const dataValidationService = {
  validateName,
  validateEmail,
  validatePassword,
};
