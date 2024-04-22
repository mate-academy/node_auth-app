const bcrypt = require('bcrypt');

function createHash(password) {
  return bcrypt.hash(password, Number(process.env.SALT));
}

async function compare(password, hashedPassword) {
  const isValid = await bcrypt.compare(password, hashedPassword);

  if (!isValid) {
    return 'Wrong password';
  }

  return isValid;
}

module.exports = {
  createHash,
  compare,
};
