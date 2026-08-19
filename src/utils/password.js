const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must contain at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
};

module.exports = {
  validatePassword,
};
