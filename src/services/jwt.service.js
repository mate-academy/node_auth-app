import jwt from 'jsonwebtoken';

const sing = (user) => {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '5s',
  });

  return token;
};

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

const signRefresh = (user) => {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
};

export const jwtService = {
  sing,
  verify,
  signRefresh,
  verifyRefresh,
};
