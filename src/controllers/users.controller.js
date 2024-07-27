const { User } = '../models/User.model';
const { normalize } = require('../services/user.service');

const getAll = async (req, res) => {
  const users = await User.findAll({ where: { activationToken: null } });

  res.send(users.map(normalize));
};

module.exports = {
  usersController: {
    getAll,
  },
};
