const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { resetPassService } = require('../services/resetPass.service');

const generateToken = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: 'Mail not exist' });
  }

  await resetPassService.resetPass(email);
  res.status(200).json({ message: 'Reset email sent' });
};

const updatePass = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;
  const user = await User.findOne({ where: { resetToken: resetToken } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const newPassword = await bcrypt.hash(password, 10);

  user.password = newPassword;
  user.resetToken = null;
  await user.save();

  res.status(200).json({ message: 'Password successfully updated' });
};

exports.resetPassController = {
  generateToken: generateToken,
  updatePass,
};
