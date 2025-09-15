const bcrypt = require('bcrypt');
const { db } = require('../utils/db');

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await db.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    await db.token.deleteMany({ where: { userId: req.user.id } });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Change password error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { changePassword };
