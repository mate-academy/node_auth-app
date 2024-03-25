import { tokenService } from './token.service.js';
import { userService } from './user.service.js';

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

async function reset(email) {
  const user = await userService.getByEmail(email);

  if (!user) {
    return 'User with such email does not exist';
  }

  const token = await tokenService.getByUserId(user.id);

  if (token) {
    return 'You are already authorized';
  }

  return false;
}

function resetPassword(user, newPassword, confirmationPassword) {
  const passwordInvalid = validatePassword(newPassword);

  if (passwordInvalid) {
    return passwordInvalid;
  }

  if (newPassword !== confirmationPassword) {
    return 'Passwords does not match';
  }

  if (user.password === newPassword) {
    return 'New password cannot match previous one';
  }

  return false;
}

const updatePassword = async (user, newPassword, confirmationPassword) => {
  const resetInvalid = resetPassword(user, newPassword, confirmationPassword);

  if (resetInvalid) {
    return resetInvalid;
  }

  return false;
};

const isAuthorized = async (userId) => {
  const token = await tokenService.getByUserId(userId);

  if (!token) {
    return 'You are not authorized';
  }

  return false;
};

const updateEmailPasswordPost = async (user, password) => {
  if (user.password !== password) {
    return 'Wrong password';
  }

  return false;
};

const updateEmailEmailPost = async (newEmail, user) => {
  const invalidEmail = validationService.validateEmail(newEmail);

  if (invalidEmail) {
    return invalidEmail;
  }

  if (user.email === newEmail) {
    return 'New email cannot match previous one';
  }

  const userr = await userService.getByEmail(newEmail);

  if (userr) {
    return 'Error';
  }

  return false;
};

export const validationService = {
  validateEmail,
  register,
  login,
  reset,
  resetPassword,
  updatePassword,
  isAuthorized,
  updateEmailPasswordPost,
  updateEmailEmailPost,
};
