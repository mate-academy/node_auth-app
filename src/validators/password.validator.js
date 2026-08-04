function validatePassword(password) {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('The password must contain an uppercase letter.');
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('The password must contain a lowercase letter.');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('The password must contain a digit.');
  }

  if (!/[!@#$%^&*()]/.test(password)) {
    throw new Error(
      'The password must contain at least one special character ' +
        '(! @ # $ % ^ & * ( )).',
    );
  }
}

module.exports = validatePassword;
