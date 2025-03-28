class Validation {
  email = (email) => {
    const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

    if (!email) {
      return 'Email is required';
    }

    if (!emailPattern.test(email)) {
      return 'Email is not valid';
    }
  };
  password = (password) => {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'At least 6 characters';
    }
  };
}

const validate = new Validation();

module.exports = { validate };
