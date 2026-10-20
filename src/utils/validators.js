import validator from 'validator';

export const validateName = (name) => {
  if (typeof name !== 'string') {
    return 'Name must be a string.';
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return 'Name cannot be empty.';
  }

  if (trimmedName.length > 40) {
    return 'Name cannot be longer then 40 symbolth.';
  }
};

export const validatePassword = (password) => {
  if (typeof password !== 'string') {
    return 'Password must be a string.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  if (password.length > 40) {
    return 'Password must be at most 40 characters long.';
  }

  if (/[а-яёА-ЯЁ]/.test(password)) {
    return 'Password must not contain Cyrillic letters.';
  }

  if (/\s/.test(password)) {
    return 'Password must not contain spaces.';
  }

  if (!/[!@#$%^&*()_+=\-[\]{};':",./<>?\\|~`]/.test(password)) {
    return 'Password must contain at least one special character.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }

  const digits = password.replace(/\D/g, '');

  if (digits.length < 4) {
    return 'Password must contain at least 4 digits.';
  }
};

export const validateEmail = (email) => {
  if (typeof email !== 'string') {
    return 'Email must be a string.';
  }

  if (!validator.isEmail(email)) {
    return 'Email is not valid.';
  }
};
