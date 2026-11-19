import bcrypt from 'bcrypt';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

async function validateOldPassword(password, passwordInDatabase) {
  const isPasswordValid = await bcrypt.compare(password, passwordInDatabase);
  if (!isPasswordValid) {
    return 'Entered old password is wrong!';
  }
}


function validateConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'Entered old password is wrong!';
  }
}

export const validationService = {
  validateEmail,
  validatePassword,
  validateName,
  validateOldPassword,
  validateConfirmPassword,
}