export const validateName = (value) => {
  if (typeof value !== 'string') {
    return 'Name must be a string';
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 'Name is required';
  }

  if (trimmedValue.length < 3) {
    return 'Name must be at least 3 characters';
  }

  const namePattern = /^[a-zA-Zа-щА-ЩЬьЮюЯяІіЇїЄєҐґ-]{3,20}$/;

  if (!namePattern.test(trimmedValue)) {
    return 'Name contains invalid characters';
  }
};

export const validateEmail = (value) => {
  if (typeof value !== 'string') {
    return 'Email must be a string';
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 'Email is required';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmedValue)) {
    return 'Email is not valid';
  }
};

export const validatePassword = (value) => {
  if (typeof value !== 'string') {
    return 'Password must be a string';
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 'Password is required';
  }

  if (trimmedValue.length < 6) {
    return 'Password must be at least 6 characters';
  }
};
