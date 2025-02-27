import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(
    users.map(
      userService.normalize, // 'normalize' transfers only id and email
    ),
  );
};

const changeName = async (req, res) => {
  const { newName } = req.body;
  const { id } = req.user;

  await userService.changeName(newName, id);

  res.status(200).send({ message: 'Name changed successfully' });
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  const { id } = req.user;

  await userService.changePassword(password, id);

  res.status(200).send({ message: 'Password changed successfully' });
};

const changeEmail = async (req, res) => {
  const { email: newEmail } = req.body;
  const { id, email } = req.user;

  await userService.changeEmail(email, newEmail, id);

  res.status(200).send({ message: 'Email changed successfully' });
};

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
  changeEmail,
};
