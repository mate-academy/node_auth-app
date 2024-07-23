import 'dotenv';
import jwt from 'jsonwebtoken';

// Access Token
export const createAccessToken = (user) => {
  const publicUserData = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET, {
    expiresIn: '10s',
  });
};

export const verifyAccessToken = (accessToken) => {
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

export const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
  } catch (error) {
    return null;
  }
};

// Password Reset Token
export const createResetToken = (user) => {
  const publicUserData = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET_RESET, {
    expiresIn: '24h',
  });
};

export const verifyResetToken = (resetToken) => {
  try {
    return jwt.verify(resetToken, process.env.JWT_SECRET_RESET);
  } catch (error) {
    console.log(error);
    return null;
  }
};
