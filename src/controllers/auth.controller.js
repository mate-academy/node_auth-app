/* eslint-disable */
const { User } = require('../models/User.js');
const usersService = require('../services/user.service.js');
const jwtService  = require('../services/jwt.service.js');
const bcrypt = require('bcrypt');
const tokenService = require('../services/token.service.js');
const { sendForgotEmail, sendUpdateEmail, sendUpdateOldEmail } = require('../services/email.service.js');

const crypto = require('crypto');

const { ApiError } = require('./exeptions/api.error.js');

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

const validatePassword = (value) => {
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
    password: validatePassword(password)
  }

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);
  await usersService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};


const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such User');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Please activate your email first');
  }

  generateTokens(res, user);

}

const refresh = async (req, res) => {
    const { refreshToken } = req.cookies;
    const userData = jwtService.verifyRefresh(refreshToken);
    const token = await tokenService.getByToken(refreshToken);


    if (!userData || !token) {
      throw ApiError.unauthorized();
    }

    const user = await usersService.findById(userData.id);
    generateTokens(res, user);
}

const generateTokens = async (res, user) => {

  const normalizedUser = usersService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 *60 * 1000,
    httpOnly: true
  })

  res.send({
    user: normalizedUser,
    accessToken
  })
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);

}


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await usersService.findByEmail(email);

  if (!user) {
    return res.sendStatus(200); 
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; 
  await user.save();

  await sendForgotEmail(email, resetToken);

  res.send({ message: 'Email sent' });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    where: { resetPasswordToken: token }
  });

  if (!user || user.resetPasswordExpires < Date.now()) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.send({ message: 'Password updated' });
};

const updatedName = async (req, res) => {
  const { name } = req.body;
  const userData = req.user;

  const user = await usersService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.name = name;
  await user.save();

  res.send({ message: 'Name updated' });

}

const updatePassword = async (req, res) => {
  const { password, newPassword, confirmation } = req.body;
  const userData = req.user;

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await usersService.findByEmail(userData.email);


  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password updated' });

}


const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const userData = req.user;

  const user = await usersService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const activationToken = jwtService.sign({ 
      newEmail,
      currentEmail: userData.email
   });

  await sendUpdateEmail(newEmail, activationToken);

  res.send({ message: 'Check your new email' });
};

const activateUpdatedEmail = async (req, res) => {
  const { activationToken } = req.params;

  const tokenData = jwtService.verify(activationToken);
  if (!tokenData) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const user = await usersService.findByEmail(tokenData.currentEmail);
  const oldEmail = user.email;

  user.email = tokenData.newEmail; 
  await user.save();

  await sendUpdateOldEmail(oldEmail);

  res.send({ message: 'Email updated' });
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  updatedName,
  updatePassword,
  updateEmail,
  activateUpdatedEmail
};
