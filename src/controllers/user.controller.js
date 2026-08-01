const { userService } = require('../services/user.service.js');

const getAllActivated = async (req, res) => {
  const rawUsers = await userService.getAllActivated();

  res.send(rawUsers.map(userService.normalize));
};

const updateName = async (req, res) => {
  const { newName } = req.body;
  const userId = req.user.id;

  const user = await userService.updateName({ userId, newName });

  res.send(userService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const userId = req.user.id;

  await userService.updatePassword({
    userId,
    oldPassword,
    newPassword,
    confirmation,
  });

  res.sendStatus(204);
};

const requestEmailChange = async (req, res) => {
  const { password, newEmail } = req.body;
  const userId = req.user.id;

  await userService.requestEmailChange({ userId, password, newEmail });

  res.send({ message: 'OK' });
};

const confirmEmailChange = async (req, res) => {
  const { emailChangeToken } = req.params;

  const user = await userService.confirmEmailChange({ emailChangeToken });

  res.send(userService.normalize(user));
};

const userController = {
  getAllActivated,
  updateName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
};

module.exports = { userController };
