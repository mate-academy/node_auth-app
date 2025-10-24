const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z\- ]{3,20}$/;

function validateUsername(value) {
  if (!value) {
    return 'Username is required';
  }

  if (!USERNAME_PATTERN.test(value)) {
    return 'Username is not valid';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
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

exports.validate = {
  validateUsername,
  validateEmail,
  validatePassword,
};
