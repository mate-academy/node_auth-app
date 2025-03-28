const jwt = require('jsonwebtoken');

class JwtService {
  sign = (user) => {
    const token = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: '10m',
    });

    return token;
  };
  verify = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_KEY);
    } catch {
      return null;
    }
  };

  signRefresh = (user) => {
    const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

    return token;
  };
  verifyRefresh = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_KEY);
    } catch {
      return null;
    }
  };
}

const jwtService = new JwtService();

module.exports = { jwtService };
