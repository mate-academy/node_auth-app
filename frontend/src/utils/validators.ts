export function validateName(value: string) {
  const NAME_PATTERN = /^[a-zA-Zа-щА-ЩЬьЮюЯяІіЇїЄєҐґ-]{3,20}$/;

  if (!value) return 'Name is required';
  if (value.length < 3) return 'At least 3 characters';
  if (!NAME_PATTERN.test(value)) return 'Name is not valid';
}

export function validateEmail(value: string) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

export const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
};
