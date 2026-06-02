import jwt from 'jsonwebtoken';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '1h' });

  return token;
}

function verify(token) {
  try {
    const user = jwt.verify(token, process.env.JWT_KEY);

    return user;
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
}

function verifyRefresh(token) {
  try {
    const user = jwt.verify(token, process.env.JWT_REFRESH_KEY);

    return user;
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
