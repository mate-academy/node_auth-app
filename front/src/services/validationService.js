function validateFullName(fullName) {
  if (fullName.length > 30) {
    return false;
  }

  const checkNameExpression = new RegExp(
    /^[\p{Alphabetic}+]([-.'\s]?\p{Alphabetic}+)*$/u
  );

  if (checkNameExpression.exec(fullName)) {
    return true;
  } else {
    return false;
  }
}

function validateEmailField(email) {
  if (!email) {
    return false;
  }

  if (email.length > 320) {
    return false;
  }

  const checkEmailExpression = new RegExp(
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,63})+$/
  );

  if (checkEmailExpression.exec(email)) {
    return true;
  } else {
    return false;
  }
}

function validatePasswords(password, confirmPassword) {
  if (!password) {
    return {
      isValid: false,
      message: "Enter password",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password should contain more than 5 symbols",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: "Passwords don't match",
    };
  }

  return {
    isValid: true,
    message: "Success",
  };
}

export const validationService = {
  validateFullName,
  validateEmailField,
  validatePasswords,
};
