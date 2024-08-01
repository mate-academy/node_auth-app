const { getAllActivatedUsers, normalize } = require('../services/user.service');

const getAllActivated = async (req, res) => {
  const users = await getAllActivatedUsers();

  res.send(users.map(normalize));
};

module.exports = {
  getAllActivated,
};
