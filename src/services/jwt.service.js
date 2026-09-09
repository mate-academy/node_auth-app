import jwt from 'jsonwebtoken';

function sign(user) {
  const { id, email } = user;

  return jwt.sign({ id, email }, process.env.JWT_KEY, {
    expiresIn: '15m',
  });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
};
