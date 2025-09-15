/* eslint-disable no-shadow */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const { randomBytes } = require('crypto');
const { db } = require('../utils/db');
const { mailer } = require('../utils/mailer');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = randomBytes(32).toString('hex');

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        isActive: false,
        activationToken,
      },
    });

    await mailer.sendMail({
      from: '"Auth App" <no-reply@example.com>',
      to: email,
      subject: 'Activate your account',
      html: `<h1>Activate your account</h1>
             <p>Click <a href="http://localhost:3000/auth/activate/${user.id}?token=${activationToken}">here</a> to activate</p>`,
    });

    return res.status(201).json({
      message: 'User registered. Please check your email to activate.',
      userId: user.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const activate = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const user = await db.user.findUnique({ where: { id: parseInt(id, 10) } });

    if (!user || user.activationToken !== token) {
      return res.status(400).json({ message: 'Invalid activation link' });
    }

    await db.user.update({
      where: { id: user.id },
      data: { isActive: true, activationToken: null },
    });

    return res.json({ message: 'Account activated successfully' });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

const test = async (req, res) => {
  const users = await db.user.findMany();

  res.json({ count: users.length, users });
};

module.exports = { register, activate, test };
