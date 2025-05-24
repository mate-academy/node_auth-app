const jwt = require('jsonwebtoken');

function sign(id, expiresIn) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  sign,
  verify,
};
