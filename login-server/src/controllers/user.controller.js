import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  const updatedUser = await userService.updateName(userId, name);

  res.send(userService.normalize(updatedUser));
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  const updatedPassword = await userService.updatePassword(
    userId,
    currentPassword,
    newPassword,
  );

  await userService.updatePassword(
    userId,
    currentPassword,
    newPassword,
    confirmPassword,
  );

  res.sendStatus(200).send({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, email, confirmEmail } = req.body;

  const userId = req.user.id;

  const updatedEmail = await userService.updateEmail(
    userId,
    password,
    email,
    confirmEmail,
  );

  const user = userService.normalize(updatedUser);

  res.status(200).send({ user, accessToken: jwtService.sign(user) });
};

export const userController = {
  getAllActivated,
  updateName,
  updatePassword,
  updateEmail,
};
