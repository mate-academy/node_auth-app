const { User } = require('../models/Users');
const { randomBytes } = require('crypto');
const bcrypt = require('bcrypt');
const { transport } = require('../config/mailconfig');

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: 'User with an unregistered email address',
      });
    }

    const resetToken = randomBytes(32).toString('hex');

    const resetPasswordExpiry = new Date(Date.now() + 3600000);

    await user.update({
      reset_password_token: resetToken,
      reset_password_expiry: resetPasswordExpiry,
    });

    await transport.sendMail({
      from: '"A Minha Aplicação" <no-reply@exemplo.com>',
      to: email,
      subject: 'Redefinição de Senha',
      text: `Olá ${user.name}, redefina a sua senha ao clicar no link: http://localhost:3003/reset-password?token=${resetToken}`,
      html: `<p>Olá <b>${user.name}</b>,</p><p>Clica <a href="http://localhost:3003/reset-password?token=${resetToken}">aqui</a> para redefinição de senha.</p>`,
    });

    return res.status(200).json({
      message: 'Password reset email sent sucess',
    });
  } catch (error) {
    res.status(500).json({ message: 'error recover password' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.query;
    const { newPass, confirmPass } = req.body;

    if (newPass.length < 8) {
      return res.status(400).json({
        message: 'error minimum character count not met',
      });
    }

    if (newPass !== confirmPass) {
      return res.status(400).json({
        message: 'Password and password confirmation are incompatible.',
      });
    }

    const user = await User.findOne({
      where: {
        reset_password_token: token,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'error the user existing' });
    }

    if (new Date(user.reset_password_expiry) < Date.now()) {
      return res.status(400).json({ message: 'token expired' });
    }

    const newPassHash = await bcrypt.hash(newPass, 10);

    await user.update({
      password: newPassHash,
      reset_password_token: null,
      reset_password_expiry: null,
    });

    return res.status(200).json({ message: 'reset password sucess' });
  } catch (error) {
    res.status(500).json({ message: 'error reset password' });
  }
}

module.exports = { forgotPassword, resetPassword };
