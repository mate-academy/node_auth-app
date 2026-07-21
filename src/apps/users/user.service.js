const validateEmail = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  const errors = [];

  if (!email) errors.push('Email is required');
  if (!emailPattern.test(email)) errors.push('Email is not valid');

  return errors;
}

const validatePassword = (password) => {
  const errors = [];

  if (!password) errors.push('Password is required');
  if (password.length < 6) errors.push('At least 6 characters');

  return errors;
};

const normalizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

module.exports = { validateEmail, validatePassword, normalizeUser };
