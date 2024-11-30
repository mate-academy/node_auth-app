const jwt = require('jsonwebtoken');

const sign = (user) => {
  const token = jwt.sign(user, process.env.JWT_KEY);

  return token;
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = {
  jwtService: {
    sign,
    verify,
  },
};
