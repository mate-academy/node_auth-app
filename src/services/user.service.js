const { Token } = require('../models/token.js');
const { User } = require('../models/user.js');

async function getUser(id) {
  return User.findOne({ where: { id } });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

const getUserToken = async (userId) => {
  return Token.findOne({ where: { userId } });
};

const userService = {
  normalize,
  findByEmail,
  getUser,
  getUserToken,
};

module.exports = {
  userService,
};
