const authService = require('../services/auth.service');
const { validatePassword } = require('../utils/password');
const emailService = require('../services/email.service');
const tokenService = require('../services/token.service');

const getProfile = (req, res) => {
  const { user } = req;

  return res.status(200).send({
    id: user.id,
    name: user.name,
    email: user.email,
  });
};

const updateName = async (req, res) => {
  const { user } = req;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send({
      message: 'Name is required',
    });
  }

  await authService.updateUserName(user, name.trim());

  return res.status(200).send({
    message: 'Name updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

const changePassword = async (req, res) => {
  const { user } = req;
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword || !newPassword || !confirmation) {
    return res.status(400).send({
      message: 'Old password, new password and confirmation are required',
    });
  }

  const isOldPasswordCorrect = await authService.checkPassword(
    oldPassword,
    user.password,
  );

  if (!isOldPasswordCorrect) {
    return res.status(400).send({
      message: 'Old password is incorrect',
    });
  }

  if (newPassword !== confirmation) {
    return res.status(400).send({
      message: 'Passwords do not match',
    });
  }

  const passwordErrors = validatePassword(newPassword);

  if (passwordErrors.length) {
    return res.status(400).send({
      message: 'Password does not meet requirements',
      errors: passwordErrors,
    });
  }

  await authService.updatePassword(user, newPassword);

  return res.status(200).send({
    message: 'Password updated successfully',
  });
};

const requestEmailChange = async (req, res) => {
  const { user } = req;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: 'New email and password are required',
    });
  }

  const isPasswordCorrect = await authService.checkPassword(
    password,
    user.password,
  );

  if (!isPasswordCorrect) {
    return res.status(400).send({
      message: 'Password is incorrect',
    });
  }

  if (email === user.email) {
    return res.status(400).send({
      message: 'New email must be different from current email',
    });
  }

  const existingUser = await authService.findByEmail(email);

  if (existingUser) {
    return res.status(400).send({
      message: 'User with this email already exists',
    });
  }

  const emailChangeToken = await authService.createEmailChangeToken(
    user,
    email,
  );

  await emailService.sendEmailChangeConfirmation(email, emailChangeToken);

  return res.status(200).send({
    message: 'Confirmation email sent to your new email address',
  });
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  const user = await authService.findByEmailChangeToken(token);

  if (!user) {
    return res.status(404).send({
      message: 'Invalid email confirmation token',
    });
  }

  const newEmail = user.newEmail;
  const oldEmail = await authService.confirmEmailChange(user);

  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  const accessToken = tokenService.generateAccessToken(user);

  return res.status(200).send({
    message: 'Email changed successfully',
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

module.exports = {
  getProfile,
  updateName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
