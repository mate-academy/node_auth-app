import jwt from 'jsonwebtoken';

const sign = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '10m' });
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const jwtService = {
  sign,
  verify,
};
