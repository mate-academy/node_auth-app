const { randomBytes, createHash } = require('node:crypto');

const getToken = () => {
  return randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

module.exports = {
  getToken,
  hashToken,
};
