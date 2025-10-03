const { db } = require('../utils/db');
const { mailer } = require('../utils/mailer');
const { randomBytes } = require('crypto');
const { addHours } = require('date-fns');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        message: 'If that email is registered, a reset link was sent',
      });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), 1);

    await db.passwordReset.deleteMany({ where: { userId: user.id } });

    await db.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `http://localhost:3000/auth/reset-password/${user.id}?token=${token}`;

    await mailer.sendMail({
      from: '"Auth App" <no-reply@example.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset</h1>
        <p>This link will expire in 1 hour.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    });

    return res
      .status(200)
      .json({ message: 'If that email is registered, a reset link was sent' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Forgot password error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { forgotPassword };
