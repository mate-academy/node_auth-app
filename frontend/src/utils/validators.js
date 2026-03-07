export const validateEmail = (value) => {
  if (!value) return 'Email обовʼязковий';
  if (!/^[\w-+]+@([\w-]+\.){1,3}[\w-]{2,}$/.test(value)) return 'Невірний email';
};

export const validatePassword = (value) => {
  if (!value) return 'Пароль обовʼязковий';
  if (value.length < 6) return 'Мінімум 6 символів';
};

export const validateConfirmation = (password, confirmation) => {
  if (!confirmation) return 'Підтвердження обовʼязкове';
  if (password !== confirmation) return 'Паролі не співпадають';
};
