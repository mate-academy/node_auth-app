import jwt from 'jsonwebtoken';
import 'dotenv/config';

function generateAuthToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '5s' });
}

export const jwtService = {
  generateAuthToken,
};
