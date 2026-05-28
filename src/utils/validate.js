const name = (nameUser) => {
  if (!nameUser || typeof nameUser !== 'string') {
    return 'Name is required';
  }

  if (nameUser.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  return null;
};

const email = (emailUser) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailUser) {
    return 'Email is required';
  }

  if (!emailRegex.test(emailUser)) {
    return 'Invalid email format';
  }

  return null;
};

const password = (passwordUser) => {
  if (!passwordUser) {
    return 'Password is required';
  }

  if (passwordUser.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
};

export const Validate = {
  email,
  name,
  password,
};
