const bcrypt = require('bcrypt');

function createHash(password) {
  return bcrypt.hash(password, 10);
}

async function compare(password, hash) {
  const isValid = await bcrypt.compare(password, hash);

  if (!isValid) {
    return 'Wrong password';
  }
}

module.exports = {
  bcryptService: {
    createHash,
    compare,
  },
};
