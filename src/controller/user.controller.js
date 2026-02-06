import { userServices } from '../services/user.services.js';
import { emailServices } from '../services/email.services.js';
import bcrypt from 'bcrypt';

const updateName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await userServices.updateNameService(userId, name);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.send(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmation } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword || !confirmation) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmation) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await userServices.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { password, newEmail, confirmation } = req.body;
    const userId = req.user.userId;

    if (!password || !newEmail || !confirmation) {
      return res
        .status(400)
        .json({ message: 'Password, new email and confirmation are required' });
    }

    if (newEmail !== confirmation) {
      return res.status(400).json({ message: 'Emails do not match' });
    }

    const user = await userServices.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const oldEmail = user.email;

    user.email = newEmail;

    await user.save();
    await emailServices.sendEmailChangedNotification(oldEmail, newEmail);

    res.send({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const userController = {
  updateName,
  updateEmail,
  updatePassword,
};
