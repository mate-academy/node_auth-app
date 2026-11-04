export const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : email;
