import jwt from 'jsonwebtoken';

function signAccess(user) {
  const { id, name, email } = user;

  return jwt.sign({ id, name, email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '10m',
  });
}

function verifyAccess(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function signRefresh(user) {
  const { id, name, email } = user;

  return jwt.sign({ id, name, email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  signAccess,
  verifyAccess,
  signRefresh,
  verifyRefresh,
};
