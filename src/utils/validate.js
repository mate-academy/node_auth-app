export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) {
    return 'Email is invalid';
  }
};

export const validatePassword = (password) => {
  if (!password.trim()) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
};
