import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sing(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '1h' });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return null;
  }
}

export const jwtService = { sing, verify };
