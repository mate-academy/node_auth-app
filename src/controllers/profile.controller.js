import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import nodemailer from 'nodemailer';

const updateProfile = async (req, res) => {
  const { name, email, password, newPassword } = req.body;
  const user = await User.findByPk(req.session.userId);

  if (!user) {
    return res.status(400).json({ message: 'User not found.' });
  }

  if (email) {
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    if (user.email === email) {
      return res.status(400).json({ message: 'New email cannot be the same as the current email.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Change Notification',
      text: `Your email address has been updated to ${email}. If you did not request this change, please contact support.`,
    });

    user.email = email;
  }

  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
  }

  if (name) user.name = name;

  await user.save();

  res.status(200).json({ message: 'Profile updated successfully!' });
};

export const profileController = {
  updateProfile,
};
