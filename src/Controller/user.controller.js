const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const sendMail = require('../SendMail/SendMail');

const getUser = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email'],
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
};
const updateName = async (req, res) => {
  const { name } = req.body;
  const user = await User.findByPk(req.user.id);

  user.name = name;
  await user.save();

  res.json({ message: 'Name updated successfully' });
};
const updateEmail = async (req, res) => {
  const { password, newEmail, confirmEmail } = req.body;
  const user = await User.findByPk(req.user.id);

  if (newEmail !== confirmEmail) {
    return res.status(400).json({ message: 'Emails do not match' });
  }

  const existingEmail = await User.findOne({ where: { email: newEmail } });

  if (existingEmail) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  await sendMail(
    newEmail,
    'Email Change Confirmation',
    `<h1>Email Change Confirmation</h1>
     <p>Your email has been changed successfully to ${newEmail}.</p>`,
  );

  user.email = newEmail;
  await user.save();

  return res.json({ message: 'Email updated successfully' });
};
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Invalid old password' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid old password' });
  }

  const password = await bcrypt.hash(newPassword, 10);

  user.password = password;
  await user.save();

  return res.json({ message: 'Password updated successfully' });
};

module.exports = {
  getUser,
  updateName,
  updateEmail,
  updatePassword,
};
