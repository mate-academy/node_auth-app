// src/utils/validators.ts

// 1. Єдиний регулярний вираз для перевірки Email
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 2. Універсальна чиста функція перевірки
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

// 3. Готові функції валідації для Formik або кастомних форм
export const validateEmail = (value: string): string | undefined => {
  if (!value) return 'Email is required.';
  if (!isValidEmail(value)) return 'Invalid email format';
};

export const validatePassword = (value: string): string | undefined => {
  if (!value) return 'A password is required.';
  if (value.length < 6) return 'Minimum of 6 characters';
};

export const validateName = (value: string): string | undefined => {
  if (!value) return 'The name is required.';
  if (value.trim().length < 3) return 'Minimum of 3 characters';
};