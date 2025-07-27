const { userService } = require('../services/user.service.js');

const handleGetActivatedUsers = async (req, res) => {
  const users = await userService.getAllActivated();

  return res.send(users.map(userService.normalize));
};

module.exports = {
  userController: {
    getAllActivated: handleGetActivatedUsers,
  },
};
