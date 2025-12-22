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
  if (!value) {
    return 'name is required';
  }

  const valueTrim = value.trim();
  const namePattern = /^[A-Za-z\s-]+$/;

  if (valueTrim.length < 4) {
    return 'At least 4 characters';
  }

  if (valueTrim.length > 12) {
    return 'No more than 12 characters';
  }

  if (!namePattern.test(valueTrim)) {
    return 'name is not valid, use only letters, spaces, and hyphens.';
  }
}

export const validate = {
  email,
  password,
  name,
};
