import jwt from 'jsonwebtoken';

function generateAccessToken(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '30s' });

  return token;
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function generateAccessTokenRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: '30d',
  });

  return token;
}

function verifyAccessTokenRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  generateAccessTokenRefresh,
  verifyAccessToken,
  verifyAccessTokenRefresh,
};
