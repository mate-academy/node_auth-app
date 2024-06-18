function validateEmail(email) {
  if (!email.trim()) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+=]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password.trim()) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password needs to have at least 6 characters';
  }
}

function validateName(name) {
  if (!name.trim()) {
    return 'Name is required';
  }
}

module.exports = { validateEmail, validatePassword, validateName };
