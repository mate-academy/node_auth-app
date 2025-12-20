export const passwordRules = [
  {
    id: 'length',
    label: 'Мінімум 8 символів',
    test: (value) => value.length >= 8,
  },
  {
    id: 'upper',
    label: 'Хоча б одна велика літера',
    test: (value) => /[A-ZА-ЯЁЇІЄҐ]/.test(value),
  },
  {
    id: 'lower',
    label: 'Хоча б одна мала літера',
    test: (value) => /[a-zа-яёїієґ]/.test(value),
  },
  {
    id: 'digit',
    label: 'Хоча б одна цифра',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'symbol',
    label: 'Спецсимвол !@#$%^&* тощо',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export const checkPassword = (password) =>
  passwordRules.map((rule) => ({
    ...rule,
    valid: rule.test(password ?? ''),
  }));

export const isPasswordStrong = (password) =>
  passwordRules.every((rule) => rule.test(password ?? ''));
