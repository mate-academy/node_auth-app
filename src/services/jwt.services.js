const jwt = require('jsonwebtoken');
const { userDto } = require('../dto/user.dto');
const { ApiError } = require('../exeptions/auth.error');

const sign = (payload, key, expiresIn) => jwt.sign(payload, key, { expiresIn });

const verify = (token, key) => {
  try {
    return jwt.verify(token, key);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('The token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('The token is invalid');
    } else {
      throw ApiError.unauthorized('Token verification failed');
    }
  }
};

const generateAccessToken = (payload) =>
  sign(payload, process.env.JW_ACCESS_KEY, '10m');

const generateRefreshToken = (payload) =>
  sign(payload, process.env.JW_REFRESH_KEY, '30d');

const getUserWithToken = async (res, user) => {
  const accessToken = generateAccessToken({ email: user.email });
  const refreshToken = generateRefreshToken({ email: user.email });

  res.cookie('refreshToken', refreshToken, {
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
