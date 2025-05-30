import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined in .env');

  return jwt.sign({ id: userId }, secret, {
    expiresIn: '1h',
  })
};
