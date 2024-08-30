const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User.model');

const usersService = require('../services/users.service');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {};

  if (!name) {
    errors.name = 'Name is empty';
  }

  if (!email) {
    errors.email = 'Email is empty';
  } else {
    const existingUser = await usersService.findByEmail(email);

    if (existingUser) {
      errors.email = 'User with this email already exists';
    }
  }

  if (!password) {
    errors.password = 'Password is empty';
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Invalid credentials', errors);
  }

  const newUser = await User.create({ name, email, password });

  res.send(newUser);
};

module.exports = {
  register,
};
