import { User, Token } from '../models/index.js';
import { createToken } from '../services/token.service.js';
import { sendEmail } from '../services/email.service.js';
import { hashPassword } from '../utils/hash.js';

export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    const token = await createToken(user.id, 'reset_password', 30);

    await sendEmail(
      email,
      'Password reset',
      `Link: http://localhost:3000/reset-password?token=${token.token}`,
    );
  }

  return res.json({
    message: 'If the email exists, we will send a reset link.',
  });
}

export async function resetPassword(req, res) {
  const { token, password, confirmation } = req.body;

  if (!token || !password || !confirmation) {
    return res.status(400).json({ message: 'Required fields' });
  }

  if (password !== confirmation) {
    return res.status(400).json({ message: 'The passwords do not match' });
  }

  const resetToken = await Token.findOne({
    where: { token, type: 'reset_password' },
  });

  if (!resetToken || resetToken.expires_at < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const user = await User.findByPk(resetToken.user_id);

  user.password_hash = await hashPassword(password);
  await user.save();

  await resetToken.destroy();

  res.json({
    message: 'Password successfully reset',
  });
}
