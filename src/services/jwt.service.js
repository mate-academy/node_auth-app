import jsonwebtoken from 'jsonwebtoken';

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_ACCESS_SECRET);
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  validateAccessToken,
};
