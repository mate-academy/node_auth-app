export function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password should be at least 6 characters';
  }
}

export function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 4) {
    return 'Name should be at least 4 characters';
  }
}
