const userService = require('../services/user.service');
const validator = require('validator');
const profilePage = async (req, res) => {
  if (req.user) {
    res
      .status(200)
      .json({ message: 'Welcome to Profile Page', user: req.user });
  }
};

const nameChange = async (req, res) => {
  const { name, email } = req.body;
  const id = Number(req.user.userId);

  if (!name) {
    return res.status(401).json({ message: 'Name is empty' });
  }

  const updatedUser = await userService.updateName({ id, name, email });

  if (!updatedUser) {
    return res.status(400).json({ message: 'unable to update name' });
  }

  return res.status(200).json({
    message: `Name updated Successfully from ${name} to ${updatedUser.name}`,
  });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  const email = req.user.email;
  const id = Number(req.user.userId);
  const validateNewMail = validator.isEmail(newEmail);

  if (!validateNewMail) {
    return res.status(404).json({ message: 'Enter valid email to change' });
  }

  const updatedEmail = await userService.updateEmail({
    id,
    email,
    password,
    newEmail,
  });

  if (updatedEmail.success) {
    return res.status(200).json({ message: updatedEmail.message });
  }

  return res.status(404).json({ message: updatedEmail.message });
};

const changePassword = async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  const email = req.user.email;

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: 'Confirmation password is different.' });
  }

  const updatedPassword = await userService.updatePassword({
    email,
    oldPassword,
    newPassword,
    confirmPassword,
  });

  if (updatedPassword.success) {
    return res
      .status(updatedPassword.code)
      .json({ message: updatedPassword.message, user: updatedPassword.user });
  } else {
    return res
      .status(updatedPassword.code)
      .json({ message: updatedPassword.message });
  }
};

const userController = {
  profilePage,
  nameChange,
  changeEmail,
  changePassword,
};

module.exports = userController;
