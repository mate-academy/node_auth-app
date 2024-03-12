const userService = require("../services/user.services");

const getAllActivated = async (req, res) => {
  try {
    const users = await userService.getAllActivated();
    res.send(users.map((user) => userService.normalize(user)));
  } catch (error) {
    console.log(`Internal server found: ${error}`);
    res.send(500);
  }
};

module.exports = { getAllActivated };
