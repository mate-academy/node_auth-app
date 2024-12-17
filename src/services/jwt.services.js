const jwt = require('jsonwebtoken');
const { userDto } = require('../dto/user.dto');

const sign = (payload, key, expiresIn) => jwt.sign(payload, key, { expiresIn });

const verify = (payload, key) => {
  try {
    return jwt.verify(payload, key);
  } catch {
    return null;
  }
};

const generateAccessToken = (payload) =>
  sign(payload, process.env.JW_ACCESS_KEY, '10m');

const generateRefreshToken = (payload) =>
  sign(payload, process.env.JW_REFRESH_KEY, '30d');

const getUserWithToken = async (res, user) => {
  const accessToken = generateAccessToken({ email: user.email });
  const refreshToken = generateRefreshToken({ email: user.email });

  res.cookie('token', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  return {
    user: userDto(user),
    accessToken,
    refreshToken,
  };
};

module.exports = {
  jwtServices: {
    sign,
    verify,
    generateAccessToken,
    generateRefreshToken,
    getUserWithToken,
  },
};
