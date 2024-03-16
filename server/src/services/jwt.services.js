const jwt = require("jsonwebtoken");

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: "5s",
  });
  return token;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);
  return token;
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY, {
      expiresIn: "10s",
    });
  } catch (error) {
    return null;
  }
}

module.exports = { sign, verifyToken, signRefresh, verifyRefreshToken };
