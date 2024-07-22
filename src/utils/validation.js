export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

export const validateRegistrationData = (email, password) => {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  // Validate email and password
  if (emailError || passwordError) {
    const errors = {};

    if (emailError) {
      errors.email = emailError;
    }

    if (passwordError) {
      errors.password = passwordError;
    }

    return errors;
  }

  return undefined;
};
