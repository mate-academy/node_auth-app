function email(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function password(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

function name(value) {
  const normalized = value.trim();

  if (!normalized) {
    return 'Name is required';
  }

  if (normalized.length < 2) {
    return 'At least 2 characters';
  }
}

module.exports = {
  validate: {
    email,
    password,
    name,
  },
};
