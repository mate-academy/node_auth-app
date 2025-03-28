const { UsersServices } = require('./../services/users.service');

const getAllActivated = async (req, res) => {
  const users = await UsersServices.getAllActivated();

  res.send(users.map(UsersServices.normalize));
};

module.exports = {
  getAllActivated,
};
