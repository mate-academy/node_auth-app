function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return false;
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password requires at least 6 characters';
  }

  return false;
}

function register(email, password, name, user) {
  const emailInvalid = validateEmail(email);
  const passwordInvalid = validatePassword(password);

  if (user) {
    return 'User already exist';
  }

  if (!name) {
    return 'Please enter a name';
  }

  if (emailInvalid) {
    return emailInvalid;
  }

  if (passwordInvalid) {
    return passwordInvalid;
  }

  return false;
}

function login(email, password, user) {
  if (!email) {
    return 'Please enter an email';
  }

  if (!user) {
    return 'User with this email does not exist';
  }

  if (password !== user.password) {
    return 'Wrong password';
  }

  if (user.activationToken !== null) {
    return 'User is not activated';
  }

  return false;
}

export const validationService = {
  register,
  login,
};
