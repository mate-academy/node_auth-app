const { User } = require('../models/User.model');

const findByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

module.exports = {
  findByEmail,
};
