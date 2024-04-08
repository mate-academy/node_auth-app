require('dotenv/config');

const { ApiError } = require('../exeptions/apiError');
const { checkAuth } = require('../helpers/chechAuth.js');
const validators = require('../helpers/validators');
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const emailService = require('../services/email.service.js');
const bcrypt = require('bcrypt');

const updateName = async (req, res) => {
  const { id, name } = req.body;

  const error = {
    name: validators.validateName(name),
  };

  if (error.name || !id) {
    throw ApiError.badRequest('Bad request', error);
  }

  const user = await userService.findById(id);

  if (!user) {
    throw ApiError.notFound();
  }

  const result = await userService.update({
    id,
    name,
  });

  if (!result) {
    res.sendStatus(501);

    return;
  }

  res.sendStatus(204);
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, newPasswordCopy } = req.body;

  const id = checkAuth(req);

  const user = await userService.findById(id);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  validators.comparePassword(newPassword, newPasswordCopy);

  await userService.restorePassword({ password: newPassword, userId: user.id });
  res.sendStatus(204);
};

const updateEmailRequest = async (req, res) => {
  const { password, newEmail } = req.body;

  const error = {
    password: validators.validatePassword(password),
    email: validators.validateEmail(newEmail),
  };

  if (error.password || error.email) {
    throw ApiError.badRequest('Bad request', error);
  }

  const id = checkAuth(req);

  if (!id) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(id);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const normalizedUser = userService.normalize(user);

  normalizedUser.newEmail = newEmail;

  const emailActivationToken =
    jwtService.createEmailActivationToken(normalizedUser);

  await emailService.sendNewEmailActivation(newEmail, emailActivationToken);
  res.send('Check your email');
};

const updateEmail = async (req, res) => {
  const { token } = req.params;

  console.log('======');

  const user = jwtService.verifyEmailActivationToken(token);

  if (!user) {
    throw ApiError.badRequest('Token is expire');
  }

  await userService.updateEmail({ id: user.id, email: user.newEmail });

  await emailService.sendEmail({
    subject: 'Email was changed',
    email: user.email,
    text: 'Email for http://localhost:5173 was changed',
    html: '',
  });
  res.send({ newEmail: user.newEmail });
};

module.exports = {
  updateName,
  updateEmail,
  updatePassword,
  updateEmailRequest,
};
