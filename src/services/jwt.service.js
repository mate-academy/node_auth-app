import jwt from 'jsonwebtoken';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '5s',
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

function signRefresh(user) {
  const token = jwt.sign(user, process.env.REFRESH_KEY);

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.REFRESH_KEY);
  } catch (e) {
    return null;
  }
}

function signReset(user) {
  const token = jwt.sign(user, process.env.RESET_KEY, { expiresIn: '1h' });

  return token;
}

function verifyReset(token) {
  try {
    return jwt.verify(token, process.env.RESET_KEY);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  signReset,
  verifyReset,
};
