const { User } = require('../models/Users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function authUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'error credential invalid' });
    }

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user || !user.is_active) {
      return res.status(400).json({ message: 'user not exist or not active' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'credential invalid' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );

    return res.status(200).json({ message: 'authenticated users', token });
  } catch (error) {
    res.status(500).json({ message: 'error auth User' });
  }
}

module.exports = { authUser };
