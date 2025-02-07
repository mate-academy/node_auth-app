const { User } = require('../models/User.model');
const { bcrypt } = require('bcrypt');
const { validateEmail, validatePassword } = require('../utils/validation');
const { sendActivationLink } = require('../utils/mailer');
const { normalize } = require('../services/user.service');
const {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
} = require('../utils/jwt');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).send({
      errors,
      message: 'Validation error',
    });

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = await bcrypt.genSaltSync(1);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await sendActivationLink(email, activationToken);

  res.send(normalize(user));
};

const activate = async (req, res) => {
  const { email, token } = req.params;
  const user = await User.findOne({ where: { email } });

  if (!user || user.activationToken !== token) {
    return res.status(404);
  }

  const updatedUser = await User.update(
    { activationToken: null },
    { where: { email } },
  );

  await sendAuthentication(res, updatedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  await sendAuthentication(res, user);
};

const sendAuthentication = async (res, user) => {
  const userData = normalize(user);
  const accessToken = generateAccessToken(userData);
  const refreshToken = generateRefreshToken(userData);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = validateRefreshToken(refreshToken);

  if (!userData) {
    res.status(401).send({ message: 'Invalid token' });

    return;
  }

  const user = await User.findOne({ where: { email: userData.email } });

  if (!user) {
    res.status(401).send({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

module.exports = {
  authController: {
    register,
    activate,
    login,
    logout,
    refresh,
  },
};
