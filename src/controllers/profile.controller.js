const { User } = require('../models/user');
const { profileService } = require('../services/profile.service');
const bcrypt = require('bcrypt');

const changeName = async (req, res) => {
  const { name } = req.body;
  const userEmail = req.user.email;

  const user = await User.findOne({ where: { email: userEmail } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = name;
  await user.save();

  res.status(200).json({ message: 'Name successfully updated' });
};

const changePass = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const userEmail = req.user.email;

  const user = await User.findOne({ where: { email: userEmail } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (password !== confirmPassword) {
    return res.status(404).json({ message: 'Passwords not match' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: 'Password successfully updated' });
};

const changeMail = async (req, res) => {
  const { password, newEmail } = req.body;
  const userEmail = req.user.email;

  const user = await User.findOne({ where: { email: userEmail } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Passwords not match' });
  }

  const existing = await User.findOne({ where: { email: newEmail } });

  if (existing) {
    return res.status(400).json({ message: 'This email is already in use' });
  }

  await profileService.changeMail(user, newEmail);
  res.status(200).json({ message: 'Confirmation email sent to new address' });
};

const applyNewMail = async (req, res) => {
  const { newEmail } = req.body;
  const { resetToken } = req.params;
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const existing = await User.findOne({ where: { email: newEmail } });

  if (existing) {
    return res.status(400).json({ message: 'This email is already in use' });
  }

  await profileService.applyNewMail(user, newEmail);
  res.status(200).json({ message: 'Your mail was successfully changed!' });
};

exports.profileController = {
  changeName,
  changePass,
  changeMail,
  applyNewMail,
};
