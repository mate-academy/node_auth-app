import jwt from 'jsonwebtoken';
import 'dotenv/config';

const sign = (user) => ({
  accessToken: jwt.sign(user, process.env.JWT_KEY_ACCESS, { expiresIn: '60s' }),
  refreshToken: jwt.sign(user, process.env.JWT_KEY_REFRESH, { expiresIn: '3600s' }),
});

const verifyAccess = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY_ACCESS)
  } catch (e) {
    return null;
  }
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY_REFRESH)
  } catch (e) {
    return null;
  }
};

export const jwtService = {
  sign,
  verifyAccess,
  verifyRefresh,
};
