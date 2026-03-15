export const validateName = (value: string) => {
  const NAME_PATTERN = /^[A-Za-z]+((['-][A-Za-z]+))*$/;

  if (!value) {
    return 'Name is required';
  }

  if (!NAME_PATTERN.test(value)) {
    return 'Name is not valid';
  }
};

export const validateEmail = (value: string) => {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
};

export const validatePassword = (value: string) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};
