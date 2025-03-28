const { usersService } = require('../services/users.service');

class UsersController {
  getAllActivated = async (req, res) => {
    const users = await usersService.getAllActivated();

    res.send(users.map(usersService.normalize));
  };
}

const usersController = new UsersController();

module.exports = { usersController };
