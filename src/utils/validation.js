export const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

export const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }
};

export const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

export const validateConfirmPassword = (value, confirmation) => {
  if (!confirmation) {
    return 'Confirmation is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  if (value !== confirmation) {
    return 'Do not match';
  }
};
