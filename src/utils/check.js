export const isEmail = (email) => {
  const re = /\S+@\S+\.\S+/;

  return re.test(email);
};

export const isStrongPassword = (password) => {
  if (password.length < 8) {
    throw new Error('Password should be at least 8 characters long');
  } else if (!/\d/.test(password)) {
    throw new Error('Password should contain at least one digit');
  } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    throw new Error(
      'Password should contain at least one lowercase and one uppercase letter',
    );
  } else if (!/\W/.test(password)) {
    throw new Error('Password should contain at least one special character');
  }

  return true;
};
