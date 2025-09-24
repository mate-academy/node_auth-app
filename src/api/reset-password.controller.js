const { db } = require('../utils/db');
const { isAfter } = require('date-fns');
const bcrypt = require('bcrypt');

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'Password and confirmation are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await db.user.findUnique({ where: { id: parseInt(id, 10) } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetRecord = await db.passwordReset.findFirst({
      where: { userId: user.id, token },
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (isAfter(new Date(), resetRecord.expiresAt)) {
      return res.status(400).json({ message: 'Reset link has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      db.passwordReset.delete({ where: { id: resetRecord.id } }),
      db.token.deleteMany({ where: { userId: user.id } }),
    ]);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset password error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { resetPassword };
