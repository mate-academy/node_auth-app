import bcrypt from 'bcrypt';

export const authService = {
  hashPassword: async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  },

  comparePasswords: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
};
