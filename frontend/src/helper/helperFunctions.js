export function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

export const validUserName = value => {
  const namePattern = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ\s'-]{2,50}$/;

  if (!value) {
    return 'Name is required';
  }

  if (!namePattern.test(value)) {
    return "Use letters, spaces, ' or -, min 2 chars";
  }
};
