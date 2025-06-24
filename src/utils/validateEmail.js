const validateEmail = (email) => {
  if (!email) {
    return 'email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
    return 'email is not valid';
  }
};

module.exports = { validateEmail };
