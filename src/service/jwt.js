import jwt from 'jsonwebtoken';

const { JWT_ACCESS_KEY, JWT_REFRESH_KEY } = process.env;

const signAccess = (user) => {
  return jwt.sign(user, JWT_ACCESS_KEY);
};

const verifyAccess = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_KEY);
  } catch (error) {
    return null;
  }
};

const signRefresh = (user) => {
  return jwt.sign(user, JWT_REFRESH_KEY);
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
};

export const jwtService = {
  signAccess,
  verifyAccess,
  signRefresh,
  verifyRefresh,
};
