const { ApiError } = require('../exceptions/api.error');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const bcrypt = require('bcrypt');
const { checkRequired } = require('../utils/checkRequired');
const { validatePassword } = require('../utils/validatePassword');
const { validateEmail } = require('../utils/validateEmail');

const passReset = async (accessToken) => {
  const user = await userService.getByAccessToken(accessToken);

  if (!user) {
    throw ApiError.BadRequest('bad request', {
      noUser: 'no user was found',
    });
  }

  await emailService.sendPassConfirmationEmail(user.email, accessToken);

  return userService.normalize(user);
};

const passResetConfirm = async (accessToken, newPass, newPassConfirmation) => {
  const errors = {
    accessToken: checkRequired(accessToken, 'access token'),
    newPass: validatePassword(newPass),
    newPassConfirmation: checkRequired(
      newPassConfirmation,
      'new password confirmation',
    ),
  };

  if (errors.accessToken || errors.newPassConfirmation || errors.newPass) {
    throw ApiError.BadRequest('bad request', errors);
  }

  const user = await userService.getByAccessToken(accessToken);

  if (!user) {
    throw ApiError.notFound();
  }

  if (!(newPass === newPassConfirmation)) {
    throw ApiError.BadRequest('entered passwords are not equal');
  }

  user.password = await bcrypt.hash(newPass, 10);
  user.save();

  return user;
};

const changeName = async (newName, accessToken) => {
  const newNameRequiredError = checkRequired(newName, 'new name');

  if (newNameRequiredError) {
    throw ApiError.BadRequest(newNameRequiredError);
  }

  const user = await userService.getByAccessToken(accessToken);

  if (!user) {
    throw ApiError.BadRequest('bad request', {
      noUser: 'no user was found',
    });
  }

  user.name = newName;
  user.save();

  return userService.normalize(user);
};

const changeEmail = async (newEmail, password, accessToken) => {
  const errors = {
    newEmail: validateEmail(newEmail),
    password: checkRequired(password, 'password'),
  };

  if (errors.newEmail || errors.password) {
    throw ApiError.BadRequest('bad request', errors);
  }

  const user = await userService.getByAccessToken(accessToken);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('wrong password');
  }

  await emailService.sendEmailChangeConfirmation(newEmail, accessToken);

  return userService.normalize(user);
};

const changeEmailConfirm = async (newEmail, accessToken) => {
  const errors = {
    newEmail: checkRequired(newEmail, 'new email'),
    accessToken: checkRequired(accessToken, 'access token'),
  };

  if (errors.newEmail || errors.accessToken) {
    throw ApiError.BadRequest('bad request', errors);
  }

  const user = await userService.getByAccessToken(accessToken);

  await emailService.notifyOldEmail(user.email, newEmail);

  user.email = newEmail;
  user.save();

  return userService.normalize(user);
};

module.exports = {
  passReset,
  passResetConfirm,
  changeName,
  changeEmail,
  changeEmailConfirm,
};
