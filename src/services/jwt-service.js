import 'dotenv';
import jwt from 'jsonwebtoken';

export const createAccessToken = (user) => {
  const publicUserData = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET, {
    expiresIn: '10s',
  });
};

export const readAccessToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Refresh Token
export const createRefreshToken = (user) => {
  const publicUserData = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET_REFRESH, {
    expiresIn: '30s',
  });
};

export const readRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
  } catch (error) {
    // console.log(error);
    return null;
  }
};
