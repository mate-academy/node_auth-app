const bcrypt = require('bcrypt');

const checkPassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);

  return isMatch;
};

module.exports = { checkPassword };
