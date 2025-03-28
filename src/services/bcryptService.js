require('dotenv/config');

const bcrypt = require('bcrypt');

function createHash(password) {
  return bcrypt.hash(password, process.env.BCRYPT_SALT);
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
