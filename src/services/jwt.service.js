import jwt from 'jsonwebtoken';

function sign({ id, email }) {
  const token = jwt.sign({ id, email }, process.env.JWT_KEY, {
    expiresIn: '10m',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function signRefresh({ id, email }) {
  const token = jwt.sign({ id, email }, process.env.JWT_REFRESH_KEY);

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
