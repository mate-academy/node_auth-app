import jwt from 'jsonwebtoken';

function sign(user) {
  const token = jwt.sign(user, process.env.JVT_KEY, {
    expiresIn: '15s',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JVT_KEY);
  } catch (error) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JVT_REFRESH_KEY, {
    expiresIn: '7d',
  });

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JVT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
