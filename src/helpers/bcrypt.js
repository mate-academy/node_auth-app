const bcrypt = require('bcrypt');

const createHash = (password) => {
  return bcrypt.hash(password, Number(process.env.SALT));
};

const compare = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password, hashedPassword);

  if (!isValid) {
    return 'Wrong password';
  }

  return isValid;
};

module.exports = {
  createHash,
  compare,
};
