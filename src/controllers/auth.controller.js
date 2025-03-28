const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const {
  findByEmail,
  normalize,
  registerUser,
  activateNewEmail,
  addTokenForPassword,
} = require('../services/user.service.js');
const {
  sign,
  verifyRefresh,
  signRefresh,
} = require('../services/jwt.service.js');
const { ApiErrors } = require('../exeptions/api.error.js');
const { save, getByToken, remove } = require('../services/token.service.js');
const { sendInformationEmail } = require('../services/email.service.js');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@[\w-]+\.[\w.-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (!name) {
    errors.name = 'Enter your name';
  }

  if (errors.email || errors.password) {
    throw ApiErrors.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await registerUser(name, email, hashedPass);

  res.send('User registered. Please activate your email.');
};

const activation = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send('Email is activated');
};

const generateTokens = async (res, user) => {
  const normalizedUser = normalize(user);

  const accessToken = sign(normalizedUser);
  const refreshToken = signRefresh(normalizedUser);

  await save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findByEmail(email);

  if (!user) {
    throw ApiErrors.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiErrors.badRequest('Activate your account');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiErrors.badRequest('Wrong password');
  }

  await generateTokens(res, user);

  res.redirect('/users');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await verifyRefresh(refreshToken);

  const token = await getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiErrors.unauthorized();
  }

  const user = await findByEmail(userData.email);

  generateTokens(res, user);
};

const changePassword = async (req, res) => {
  const { email, password, newPassword, confirmationPassword } = req.body;
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw ApiErrors.badRequest('User not found');
  }

  if (!password) {
    throw ApiErrors.badRequest('The password is incorrect');
  }

  if (validatePassword(newPassword)) {
    throw ApiErrors.badRequest(validatePassword(newPassword));
  }

  if (newPassword !== confirmationPassword) {
    throw ApiErrors.badRequest('Confirmation password not equal password');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
  user.save();

  res.send(`Success! ${process.env.CLIENT_HOST}/login`);
};

const changeName = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw ApiErrors.badRequest('User not found');
  }

  if (!password) {
    throw ApiErrors.badRequest('The password is incorrect');
  }

  user.name = name;
  user.save();

  res.send('Success!');
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiErrors.badRequest('Enter your email');
  }

  await addTokenForPassword(email);

  res.send('A confirmation has been sent to your email. Follow the given link');
};

const addNewPassword = async (req, res) => {
  const { email, newPassword, confirmationPassword } = req.body;

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw ApiErrors.badRequest('User not found');
  }

  if (validatePassword(newPassword)) {
    throw ApiErrors.badRequest(validatePassword(newPassword));
  }

  if (newPassword !== confirmationPassword) {
    throw ApiErrors.badRequest('Confirmation password not equal password');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
  user.save();

  res.send(`Success! ${process.env.CLIENT_HOST}/login`);
};

const addNewEmail = async (req, res) => {
  const { newEmail, email } = req.body;

  if (!newEmail) {
    throw ApiErrors.badRequest('Enter new email');
  }

  await activateNewEmail(email, newEmail);

  res.send('A confirmation has been sent to your email. Follow the given link');
};

const changeEmail = async (req, res) => {
  const { email, password, newEmail } = req.body;
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw ApiErrors.badRequest('User not found. Enter your email');
  }

  if (!password) {
    throw ApiErrors.badRequest('The password is incorrect');
  }

  if (!newEmail) {
    throw ApiErrors.badRequest('Enter new Email');
  }

  user.email = newEmail;
  user.resetToken = null;
  user.save();

  await sendInformationEmail(email);

  res.send('Success!');
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiErrors.unauthorized();
  }

  remove(userData.id);

  res.redirect('/login');
};

module.exports = {
  register,
  activation,
  login,
  refresh,
  logout,
  changePassword,
  addNewEmail,
  changeEmail,
  changeName,
  resetPassword,
  addNewPassword,
};
