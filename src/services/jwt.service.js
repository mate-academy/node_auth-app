import jwt from 'jsonwebtoken';

export const jwtService = {
  sign(user) {
    const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '10s' });

    return token;
  },

  signConfirmToken(data) {
    const token = jwt.sign(data, process.env.JWT_KEY, { expiresIn: '1h' });

    return token;
  },

  verify(token) {
    try {
      return jwt.verify(token, process.env.JWT_KEY);
    } catch (e) {
      return null;
    }
  },

  signRefresh(user) {
    const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
      expiresIn: '30d',
    });

    return token;
  },

  verifyRefresh(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_KEY);
    } catch (e) {
      return null;
    }
  },
};
