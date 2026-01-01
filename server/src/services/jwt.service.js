import jwt from 'jsonwebtoken';

function signAccessToken(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '900s',
  });

  return token;
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function signRefreshToken(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: '30d',
  });

  return token;
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
