const { User } = require('../models/Users.js');
const bcrypt = require('bcrypt');
const { randomBytes } = require('crypto');
const { transport } = require('../config/mailconfig.js');

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'error the data is invalid' });
    }

    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'error email the user existing' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'error minimum character count not met',
      });
    }

    const activationToken = randomBytes(32).toString('hex');

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      activation_token: activationToken,
    });

    await transport.sendMail({
      from: '"A Minha Aplicação" <no-reply@exemplo.com>',
      to: email,
      subject: 'Ativação de Conta',
      text: `Olá ${name}, ativa a tua conta acedendo ao link: http://localhost:3003/activate?token=${activationToken}`,
      html: `<p>Olá <b>${name}</b>,</p><p>Clica <a href="http://localhost:3003/activate?token=${activationToken}">aqui</a> para ativares a tua conta.</p>`,
    });

    return res.status(201).json({ message: 'user register sucess' });
  } catch (error) {
    res.status(500).json({ message: 'error register user' });
  }
}

async function activatedRegister(req, res) {
  try {
    const { token } = req.query;

    const userActive = await User.findOne({
      where: {
        activation_token: token,
      },
    });

    if (!userActive) {
      return res.status(400).json({
        message: 'error token invalid or expired',
      });
    }

    await userActive.update({
      is_active: true,
      activation_token: null,
    });

    return res.status(200).json({ message: 'user active' });
  } catch (error) {
    res.status(500).json({ message: 'erro active user' });
  }
}

module.exports = { registerUser, activatedRegister };
