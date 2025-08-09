const validatePassword = (password) => {
  if (!password) {
    return 'password is required';
  }

  if (password.length < 6) {
    return 'at least 6 characters';
  }
};

module.exports = { validatePassword };
