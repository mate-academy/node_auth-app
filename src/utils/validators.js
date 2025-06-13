function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters';
  }
}

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 2) {
    return 'Name must be at least 2 characters';
  }

  const namePattern = /^[A-Za-zА-Яа-яЇїІіЄєҐґ\s'-]+$/;

  if (!namePattern.test(value)) {
    return 'Name contains invalid characters';
  }
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
};
