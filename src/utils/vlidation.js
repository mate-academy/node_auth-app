export const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  const namePattern = /^[a-zA-Z\s]+$/;

  if (
    !namePattern.test(value) ||
    value.trim().length < 2 ||
    value.trim().length > 50
  ) {
    return 'Name is not valid';
  }
};

export const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
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
