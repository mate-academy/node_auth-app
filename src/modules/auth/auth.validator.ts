import { validatePassword } from '../../utils/password.js';

export type RegisterValidationErrors = {
  name?: string;
  email?: string;
  password?: string[];
};

export type RegisterValidationResult = {
  isValid: boolean;
  errors: RegisterValidationErrors;
};

export type LoginValidationErrors = {
  email?: string;
  password?: string;
};

export type LoginValidationResult = {
  isValid: boolean;
  errors: LoginValidationErrors;
};

export type ForgotPasswordValidationErrors = {
  email?: string;
};

export type ForgotPasswordValidationResult = {
  isValid: boolean;
  errors: ForgotPasswordValidationErrors;
};

export type ResetPasswordValidationErrors = {
  password?: string[];
  confirmation?: string;
};

export type ResetPasswordValidationResult = {
  isValid: boolean;
  errors: ResetPasswordValidationErrors;
};

const validateEmail = (email: unknown): string | null => {
  if (typeof email !== 'string' || email.trim() === '') {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.)+[\w-]{2,}$/;

  const normalizedEmail = email.trim();

  if (!emailPattern.test(normalizedEmail)) {
    return 'Invalid email format';
  }

  return null;
};

const validateStrongPassword = (password: unknown): string[] | null => {
  const validation = validatePassword(password);

  if (!validation.isValid) {
    return validation.errors;
  }

  return null;
};

const validateRequiredPassword = (password: unknown): string | null => {
  if (typeof password !== 'string' || password.trim() === '') {
    return 'Password is required';
  }

  return null;
};

const validateRegisterInput = (input: unknown): RegisterValidationResult => {
  const errors: RegisterValidationErrors = {};

  if (typeof input !== 'object' || input === null) {
    return {
      isValid: false,
      errors: {
        name: 'Invalid input',
        email: 'Invalid input',
        password: ['Invalid input'],
      },
    };
  }

  const { name, email, password } = input as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (typeof name !== 'string' || name.trim() === '') {
    errors.name = 'Name is required';
  }

  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  const passwordErrors = validateStrongPassword(password);

  if (passwordErrors) {
    errors.password = passwordErrors;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLoginInput = (input: unknown): LoginValidationResult => {
  const errors: LoginValidationErrors = {};

  if (typeof input !== 'object' || input === null) {
    return {
      isValid: false,
      errors: {
        email: 'Invalid input',
        password: 'Invalid input',
      },
    };
  }

  const { email, password } = input as {
    email?: unknown;
    password?: unknown;
  };

  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validateRequiredPassword(password);

  if (passwordError) {
    errors.password = passwordError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateForgotPasswordInput = (
  input: unknown,
): ForgotPasswordValidationResult => {
  const errors: ForgotPasswordValidationErrors = {};

  if (typeof input !== 'object' || input === null) {
    return {
      isValid: false,
      errors: {
        email: 'Invalid input',
      },
    };
  }

  const { email } = input as {
    email?: unknown;
  };

  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateResetPasswordInput = (
  input: unknown,
): ResetPasswordValidationResult => {
  const errors: ResetPasswordValidationErrors = {};

  if (typeof input !== 'object' || input === null) {
    return {
      isValid: false,
      errors: {
        password: ['Invalid input'],
        confirmation: 'Invalid input',
      },
    };
  }

  const { password, confirmation } = input as {
    password?: unknown;
    confirmation?: unknown;
  };

  const passwordErrors = validateStrongPassword(password);

  if (passwordErrors) {
    errors.password = passwordErrors;
  }

  if (typeof confirmation !== 'string' || confirmation.trim() === '') {
    errors.confirmation = 'Password confirmation is required';
  }

  if (
    typeof password === 'string' &&
    typeof confirmation === 'string' &&
    confirmation.trim() !== '' &&
    password !== confirmation
  ) {
    errors.confirmation = 'Password confirmation does not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const authValidator = {
  validateEmail,
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
};
