const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (err) {
    return null;
  }
};

const signRefreshToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return refreshToken;
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    return decoded;
  } catch (err) {
    return null;
  }
};

const jwtService = {
  generateToken,
  verifyToken,
  signRefreshToken,
  verifyRefreshToken,
};

module.exports = { jwtService };
