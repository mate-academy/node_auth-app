import jwt from 'jsonwebtoken';
import 'dotenv/config';

const sign = (user) => {
  const token = jwt.sign(user, process.env.JWT_KEY);

  return token;
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
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
  } catch (e) {
    return null;
  }
};

export const jwts = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
