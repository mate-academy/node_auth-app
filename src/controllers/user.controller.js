import * as userService from '../services/user.service.js';

const changePassword = async (req, res) => {
  const { userId } = req.user;
  const { previousPassword, newPassword } = req.body;

  const user = await userService.changePassword(
    userId,
    previousPassword,
    newPassword,
  );

  res.status(200).json(user);
};

const changeName = async (req, res) => {
  const { userId } = req.user;
  const { newName } = req.body;

  const user = await userService.changeName(userId, newName);

  res.status(200).json(user);
};

const requestEmailChange = async (req, res) => {
  const { userId } = req.user;
  const { newEmail, password } = req.body;

  await userService.requestEmailChange(userId, password, newEmail);

  res.sendStatus(204);
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  const user = await userService.confirmEmailChange(token);

  res.status(200).json(user);
};

export { changePassword, changeName, requestEmailChange, confirmEmailChange };
