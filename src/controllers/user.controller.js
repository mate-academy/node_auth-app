const { userService } = require('../services/user.service');

const getAllUsers = async (req, res) => {
  const users = await userService.getUsers();

  res.send(users);
};

const resetMail = async (req, res) => {
  const { email } = req.body;

  await userService.sendResetPasswordLink(email);

  res.status(200).send('Reset mail send');
};

const reset = async (req, res) => {
  const { resetToken } = req.params;
  const { password1, password2 } = req.body;

  await userService.resetPassword(resetToken, password1, password2);

  res.status(200).send('Reset password successfully');
};

const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  res.send(user);
};

const changeName = async (req, res) => {
  const userId = req.user.id;
  const newName = req.body.name;

  await userService.updateName(userId, newName);

  res.status(200).json({ message: 'Name changed successfully' });
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword1, newPassword2 } = req.body;

  await userService.changePassword(userId, {
    oldPassword,
    newPassword1,
    newPassword2,
  });

  res.status(200).send('Password changed successfully');
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, newEmail1, newEmail2 } = req.body;

  await userService.changeEmail(userId, { password, newEmail1, newEmail2 });

  res.status(200).json({
    message: 'Email changed successfully. Notification sent to old email.',
  });
};

const userController = {
  getAllUsers,
  resetMail,
  reset,
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};

module.exports = { userController };
