import 'dotenv/config';
import jwt from 'jsonwebtoken';

export const createAccessToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '3s' });
};

export const verifyAccessToken = (token) => {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return data;
  } catch (error) {
    return null;
  }
};

export const createRefreshToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_REFRESH, { expiresIn: '999s' });
};

export const verifyRefreshToken = (token) => {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET_REFRESH);
    return data;
  } catch (error) {
    return null;
  }
};
