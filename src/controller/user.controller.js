import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  if (!users) {
    return res.status(404).send({ message: 'No activated users found' });
  }

  res.send(users.map(userService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;

  await User.update({ name }, { where: { id: req.user.id } });
  res.send({ message: 'Name updated' });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = await User.findByPk(req.user.id);

  const isValid = await bcrypt.compare(oldPassword, userId.password);

  if (!isValid) {
    return res.status(400).send({ message: 'Old password is incorrect' });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .send({ message: 'New password and confirmation do not match' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userId.update({ password: hashedPassword });

  res.send({ message: 'Password changed successfully' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const user = await User.findByPk(req.user.id);

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(400).send({ message: 'Invalid password' });
  }

  const newEmailHtml = `
    <h1>Email Change Notification</h1>
    <p>Your email has been changed to: ${newEmail}</p>`;

  await emailService.sendEmail(user.email, 'Email change', newEmailHtml);
  user.email = newEmail;
  await user.save();

  res.send({ message: 'Email updated' });
};

export const userController = {
  getAllActivated,
  updateName,
  changePassword,
  changeEmail,
};
