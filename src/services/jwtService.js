// import jwt from 'jsonwebtoken';
// import 'dotenv/config';

// const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// function sign(payload) {
//   return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
// }

// function verify(token) {
//   // throws error if invalid
//   return jwt.verify(token, ACCESS_SECRET);
// }

// function signRefresh(payload) {
//   return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
// }

// function verifyRefresh(token) {
//   return jwt.verify(token, REFRESH_SECRET);
// }

// export const jwtService = {
//   sign,
//   verify,
//   signRefresh,
//   verifyRefresh,
// };

import jwt from 'jsonwebtoken';
import 'dotenv/config';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function sign(user) {
  const token = jwt.sign(user, ACCESS_SECRET);

  return token;
}

function verify(user) {
  try {
    return jwt.verify(user, ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, REFRESH_SECRET);

  return token;
}

function verifyRefresh(user) {
  try {
    return jwt.verify(user, REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  verifyToken,
};
