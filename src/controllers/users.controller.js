const { User } = require('./models/User.model');
const bcrypt = require('bcrypt');
const { normalize } = require('../services/user.service');
// eslint-disable-next-line no-shadow
const crypto = require('crypto');

const getAll = async (req, res) => {
  const users = await User.findAll({ where: { activationToken: null } });

  res.send(users.map(normalize));
};

const createUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    email,
    password: hashedPassword,
    activationToken,
  });

  res
    .status(201)
    .json({ message: 'User created successfully', user: normalize(user) });
};

const activateUser = async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user || user.activationToken !== token) {
    return res
      .status(404)
      .json({ message: 'Invalid activation token or user not found' });
  }

  await User.update({ activationToken: null }, { where: { email } });

  const updatedUser = await User.findOne({ where: { email } });

  // eslint-disable-next-line no-undef
  await sendAuthentication(res, updatedUser);

  res.json({ message: 'User activated successfully' });
};

module.exports = {
  usersController: {
    getAll,
    createUser,
    activateUser,
  },
};
