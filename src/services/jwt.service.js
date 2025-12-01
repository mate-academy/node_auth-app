import jwt from 'jsonwebtoken';
import 'dotenv/config';

const sign = (user, expiresIn = '3000s') => {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn });

  return token;
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
};

const signReset = (user) => {
  const token = jwt.sign(user, process.env.JWT_RESET_KEY, {
    expiresIn: '600s',
  });

  return token;
};

const verifyReset = (resetToken) => {
  try {
    return jwt.verify(resetToken, process.env.JWT_RESET_KEY);
  } catch {
    return null;
  }
};

const signRefresh = (user) => {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
};

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  verifyReset,
  signReset,
};
