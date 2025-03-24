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

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (!passwordPattern.test(value)) {
    return 'Password must contain at least one letter and one number';
  }
}

export const authService = {
  validateEmail,
  validatePassword,
};
