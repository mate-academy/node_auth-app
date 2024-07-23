const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
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

const validateName = (name) => {
  if (!name.length) {
    return 'Name is required';
  }
};

const validateRegistrationData = (name, email, password) => {
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError || emailError || passwordError) {
    const errors = {};

    if (nameError) {
      errors.name = nameError;
    }

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

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRegistrationData,
};
