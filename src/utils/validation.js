export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailRegex.test(email)) {
    return 'Email is not valid';
  }
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
};
