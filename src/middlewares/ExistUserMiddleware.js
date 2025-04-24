const { User } = require('../models/user');

const existUserMiddleware = async (req, res, next) => {
  const { name, email, password } = req.body;

  const existEmail = await User.findOne({ where: { email } });
  const existName = await User.findOne({ where: { name } });

  if (existEmail || existName) {
    return res.status(400).json({ message: 'Email or name already exist' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password too short, enter 6 or more symbols' });
  }

  next();
};

module.exports = { existUserMiddleware };
