import jsonwebtoken from 'jsonwebtoken';

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '30s',
  });
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(
    user,
    process.env.JWT_REFRESH_SECRET /* {expiresIn: '2m'} */,
  );
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
