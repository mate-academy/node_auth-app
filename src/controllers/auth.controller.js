const { User } = require('../models/user.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../services/jwt.servece.js');
const { ApiError } = require('../exceptions/api.error.js');

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('invalid credentials', errors);
  }

  await userService.register({ name, email, password });

  res.send({ message: 'user created' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user || user.password !== password) {
    res.sendStatus(401);

    return;
  }

  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

module.exports = {
  authController: {
    register,
    activate,
    login,
  },
};
