const User = require('../models/User');
const bcrypt = require('bcrypt');
const mailController = require('./mailController');

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  res.json({ id: user.id, name: user.name, email: user.email });
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const user = await User.findByPk(req.user.id);

  user.name = name;
  await user.save();
  res.json({ message: 'Name updated', name: user.name });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findByPk(req.user.id);
  const valid = await bcrypt.compare(oldPassword, user.password);

  if (!valid) {
    return res.status(400).json({ message: 'Old password incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const user = await User.findByPk(req.user.id);

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ message: 'Password incorrect' });
  }

  const oldEmail = user.email;

  user.email = newEmail.toLowerCase();
  await user.save();

  await mailController.sendMail({
    to: oldEmail,
    subject: 'Email changed',
    text: `Your email was changed to ${newEmail}. If this wasn’t you, contact support immediately.`,
  });

  res.json({ message: 'Email updated, old email notified' });
};

module.exports = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
