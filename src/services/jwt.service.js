import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';

const { JWT_ACCESS_KEY, JWT_REFRESH_KEY, JWT_RESET_KEY } = process.env;

const generateAccessToken = (user) => {
  const token = jsonwebtoken.sign(user, JWT_ACCESS_KEY, { expiresIn: '10min' });

  return token;
};

const verifyAccessToken = (token) => {
  try {
    return jsonwebtoken.verify(token, JWT_ACCESS_KEY);
  } catch (err) {
    return null;
  }
};

const generateRefreshToken = (user) => {
  const token = jsonwebtoken.sign(user, JWT_REFRESH_KEY, { expiresIn: '30d' });

  return token;
};

const getExpiresAt = (token) => {
  const decoded = jsonwebtoken.decode(token);

  if (!decoded) {
    return null;
  }

  const { exp } = decoded;

  if (!exp) {
    return null;
  }

  return new Date(exp * 1000);
};

const verifyRefreshToken = (token) => {
  try {
    return jsonwebtoken.verify(token, JWT_REFRESH_KEY);
  } catch (err) {
    return null;
  }
};

const generateResetToken = (user) => {
  const token = jsonwebtoken.sign(user, JWT_RESET_KEY, {
    expiresIn: '10min',
  });

  return token;
};

const verifyResetToken = (token) => {
  try {
    return jsonwebtoken.verify(token, JWT_RESET_KEY);
  } catch (err) {
    return null;
  }
};

const jwtService = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  getExpiresAt,
};

export default jwtService;
