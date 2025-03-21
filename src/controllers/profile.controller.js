import { User } from '../models/user.model.js';

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.session.userId);

  if (!user) {
    return res.status(400).json({ message: 'User not found.' });
  }

  res.status(200).json({ user });
};

const updateProfile = async (req, res) => {
  const { name, email, password, newPassword } = req.body;
  const user = await User.findByPk(req.session.userId);

  if (!user) {
    return res.status(400).json({ message: 'User not found.' });
  }

  if (password && !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Incorrect password.' });
  }

  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
  }

  if (name) user.name = name;

  if (email) user.email = email;

  await user.save();

  res.status(200).json({ message: 'Profile updated successfully!' });
};

export const profileController = {
  getProfile,
  updateProfile,
};
