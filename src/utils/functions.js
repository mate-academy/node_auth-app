export const isEmailInvalid = (str) => {
  if (str.indexOf('@') === -1) {
    return 'Email must include @';
  }
  
  if (!(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(str.toLowerCase()))) {
    return 'Email is not valid';
  }
  
  return null;
};

export const isPasswordInvalid = (str) => {
  if (str.length < 8 || str.length > 20) {
    return 'Password must be 8 - 20 symbols'
  }

  if (!(/[a-z]/.test(str.toLowerCase()))) {
    return 'Password must contain a letter';
  }

  if (!(/[A-Z]/.test(str))) {
    return 'Password must contain at least one big letter';
  }

  if (!(/[0-9]/.test(str))) {
    return 'Password must contain a number';
  }

  return null;
};
  