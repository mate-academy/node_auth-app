'use strict';

const { ApiError } = require('../exceptions/api.error.js');
const {
  validatePassword,
  validateEmail,
} = require('../utils/validationData.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { tokenService } = require('../services/token.service.js');
const bcrypt = require('bcrypt');

const checkUserExistence = (user, id) => {
  if (!user) {
    throw ApiError.notFound(`There's no such user with id ${id}`);
  }
};

const successfulMessage = (user, updatedValueName) => {
  return {
    message: `Your ${updatedValueName} has been successfully updated!`,
    updatedUser: user,
  };
};

const register = async(req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email and password are required!');
  }

  const errors = {
    password: validatePassword(password),
    email: validateEmail(email),
  };

  if (errors.password || errors.email) {
    throw ApiError.badRequest('Validation error!', errors);
  }

  await userService.register(name, email, password);

  res.send({ message: "You've been successfully registered!" });
};

const activate = async(req, res) => {
  const { activationToken } = req.params;

  const foundUser = await userService.getUserByActivationToken(activationToken);

  if (!foundUser) {
    throw ApiError.notFound('User was not found!');
  }

  foundUser.activationToken = null;

  await foundUser.save();

  await sendAuthentication(res, foundUser);

  res.send(foundUser);
};

const login = async(req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Bad request');
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const foundUser = await userService.getUserByEmail(email);

  if (!foundUser) {
    throw ApiError.badRequest('User with this email does not exist!');
  }

  const passwordsMatch = await bcrypt.compare(password, foundUser.password);

  if (!passwordsMatch) {
    throw ApiError.badRequest('Password is incorrect!');
  }

  await sendAuthentication(res, foundUser);
};

const logout = async(req, res) => {
  const { userId } = req.params;
  const refreshToken = req.cookies[`refreshToken_${userId}`];
  const userData = jwtService.verifyToken(refreshToken, 'JWT_REFRESH_SECRET');

  if (userData) {
    await tokenService.remove(userData.id);
    res.clearCookie(`refreshToken_${userData.id}`);
  } else {
    throw ApiError.unAuthorized();
  }

  res.sendStatus(204);
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyToken(refreshToken, 'JWT_REFRESH_SECRET');

  if (!userData) {
    throw ApiError.unAuthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.unAuthorized();
  }

  const user = await userService.getUserByEmail(userData.email);

  await sendAuthentication(res, user);
};

const sendAuthentication = async(res, user) => {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateToken(
    userData,
    'JWT_ACCESS_SECRET',
    '900s'
  );
  const refreshToken = jwtService.generateToken(
    userData,
    'JWT_REFRESH_SECRET',
    '10000s'
  );

  await tokenService.save(user.id, refreshToken);

  res.cookie(`refreshToken_${user.id}`, refreshToken, {
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

const forgotPassword = async(req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required!');
  }

  const errorInEmail = validateEmail(email);

  if (errorInEmail) {
    throw ApiError.badRequest('Email validation error', {
      email: errorInEmail,
    });
  }

  await userService.forgotPassword(res, email);

  res.send('Email with password reset has been sent!');
};

const resetPassword = async(req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  if (!resetToken) {
    throw ApiError.notFound('Missing reset token!');
  }

  if (!newPassword) {
    throw ApiError.badRequest('You should provide a new password!');
  }

  const errorInPassword = validatePassword(newPassword);

  if (errorInPassword) {
    throw ApiError.badRequest('Validation error', {
      newPassword: errorInPassword,
    });
  }

  const foundUser = await userService.resetPassword(resetToken, newPassword);

  res.clearCookie('resetToken');

  res.send({
    message: 'The password has been successfully changed!',
    updatedUser: foundUser,
  });
};

const updateName = async(req, res) => {
  const { id } = req.params;
  const { updatedName } = req.body;

  const foundUser = await userService.getUserById(id);

  checkUserExistence(foundUser, id);

  if (!updatedName) {
    throw ApiError.badRequest('You need to provide an updated name!');
  }

  if (updatedName === foundUser.name) {
    throw ApiError.badRequest('No need to change your name!', {
      name: 'Your updated name is the same as the old one!',
    });
  }

  await userService.updateName(foundUser, updatedName);

  res.status(200).send(successfulMessage(foundUser, 'name'));
};

const updatePassword = async(req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword || !newPassword || !confirmation) {
    throw ApiError.badRequest(
      'You need to provide old password, new password and confirmation!'
    );
  }

  const foundUser = await userService.getUserById(id);

  checkUserExistence(foundUser, id);

  if (!(await bcrypt.compare(oldPassword, foundUser.password))) {
    throw ApiError.badRequest('Old Password is wrong!');
  }

  if (newPassword === oldPassword) {
    throw ApiError.badRequest(
      'New password should be different from your old one!'
    );
  }

  const passwordValidationError = validatePassword(newPassword);

  if (passwordValidationError) {
    throw ApiError.badRequest('Validation error', {
      newPassword: passwordValidationError,
    });
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('The new password and confirmation do not match');
  }

  await userService.updatePassword(foundUser, newPassword);

  res.status(200).send(successfulMessage(foundUser, 'password'));
};

const sendEmailConfirmation = async(req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest(
      'You need to provide a new email and current password!'
    );
  }

  const foundUser = await userService.getUserById(id);

  checkUserExistence(foundUser, id);

  if (!(await bcrypt.compare(password, foundUser.password))) {
    throw ApiError.badRequest('Incorrect password for changing email!');
  }

  if (email === foundUser.email) {
    throw ApiError.badRequest(
      'Your new email should be different from your current one!'
    );
  }

  await userService.sendEmailConfirmation(foundUser, email, res);

  res.status(200).send({
    message: `Confirm your new email please!
        You have been sent an email with confirmation!`,
  });
};

const updateEmail = async(req, res) => {
  const { confirmationToken } = req.params;

  if (!confirmationToken) {
    throw ApiError.badRequest('Missing confirmation token!');
  }

  const foundUser = await userService.updateEmail(confirmationToken);

  res.clearCookie('confirmationToken');

  res.status(200).send({
    message: 'Your email has been updated successfully!',
    updatedUser: foundUser,
  });
};

const authorizeWithGoogle = (req, res) => {
  const { displayName, emails, accessToken } = req.user;

  if (!displayName || !emails || !accessToken) {
    throw ApiError.badRequest(
      'Something went wrong! Try to authorize with google again'
    );
  }

  res.status(200).send({
    message: 'Authenticated with google!',
    user: {
      name: displayName,
      email: emails[0].value,
    },
    accessToken,
  });
};

const logoutWithGoogle = async(req, res) => {
  const { userId } = req.params;

  await tokenService.remove(userId);

  req.session.destroy((err) => {
    if (err) {
      throw ApiError.unAuthorized('Error destroying session', { error: err });
    }
    res.redirect('/auth/google');
  });
};

const authController = {
  register,
  activate,
  login,
  sendAuthentication,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  updateEmail,
  updateName,
  updatePassword,
  sendEmailConfirmation,
  authorizeWithGoogle,
  logoutWithGoogle,
};

module.exports = { authController };
