import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  const { name, currentPassword, newPassword, passwordConfirm, newEmail } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updates = {};
    let requiresPasswordVerification = false;

    if (name && name !== user.name) {
      updates.name = name;
    }

    if (newPassword) {
      requiresPasswordVerification = true;
      
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      
      if (newPassword !== passwordConfirm) {
        return res.status(400).json({ message: 'New passwords do not match.' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (newEmail && newEmail !== user.email) {
      const existingUser = await User.findOne({ where: { email: newEmail } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email already in use.' });
      }

      if (!requiresPasswordVerification) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Password required to change email.' });
        }
        
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          return res.status(400).json({ message: 'Password incorrect for email change.' });
        }
      }
      
      updates.email = newEmail.toLowerCase();
    }

    if (Object.keys(updates).length > 0) {
      await User.update(updates, { where: { id: userId } });
      
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash', 'activationToken', 'resetToken', 'resetTokenExpiresAt'] }
      });
      
      return res.status(200).json({ 
        message: 'Profile updated successfully.',
        user: updatedUser
      });
    }

    return res.status(400).json({ message: 'No changes provided.' });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    return res.status(500).json({ message: 'Server error.' });
  }
};