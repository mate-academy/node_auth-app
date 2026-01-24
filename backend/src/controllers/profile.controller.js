import { User } from '../models/index.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { sendEmail } from '../services/email.service.js';

export async function getProfile(req, res) {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'is_active'],
  });

  res.json(user);
}

export async function updateName(req, res) {
  const { nameProfile } = req.body;

  if (!nameProfile) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const user = await User.findByPk(req.user.id);

  user.name = nameProfile;
  await user.save();

  res.json({ message: 'Name updated' });
}

export async function updatePassword(req, res) {
  const { currentPassword, newPassword, confirmation } = req.body;

  if (!currentPassword || !newPassword || !confirmation) {
    return res.status(400).json({ message: 'Required fields' });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({ message: 'The passwords do not match' });
  }

  const user = await User.findByPk(req.user.id);

  const valid = await comparePassword(currentPassword, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  user.password_hash = await hashPassword(newPassword);
  await user.save();

  res.json({ message: 'Password updated successfully' });
}

export async function updateEmail(req, res) {
  const { password, newEmail, confirmation } = req.body;

  if (!password || !newEmail || !confirmation) {
    return res.status(400).json({ message: 'Required fields' });
  }

  if (newEmail !== confirmation) {
    return res.status(400).json({ message: 'Emails do not match' });
  }

  const user = await User.findByPk(req.user.id);

  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await sendEmail(oldEmail, 'Email changed', 'Your email has been changed.');

  res.json({ message: 'Email updated successfully' });
}
