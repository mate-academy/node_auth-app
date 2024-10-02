import jwt from 'jsonwebtoken';

function sign(user) {
  const token = jwt.sign(user, process.env.JVT_KEY);

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JVT_KEY);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
};
