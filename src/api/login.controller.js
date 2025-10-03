const { db } = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Please activate your email' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // eslint-disable-next-line no-unused-vars
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    await db.token.create({
      data: { refresh: refreshToken, userId: user.id },
    });

    return res.redirect(process.env.CLIENT_URL + '/profile');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { login };
