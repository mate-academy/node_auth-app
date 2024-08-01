const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exceptions/api.error');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service');
const { emailService } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');
const { resetTokenService } = require('../services/resetToken.service');
const { validatePassword } = require('../validators/passwordValidator');
const { validateName } = require('../validators/nameValidator');
const { validateEmail } = require('../validators/emailValidator');
const { emailChangesService } = require('../services/emailChanges.service');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.createUser({ name, email, password: hashedPass });

  res.statusCode = 201;
  res.send({ message: 'New user created' });
};

const sendActivation = async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  await emailService.sendActivationEmail({
    email,
    activationToken: user.activationToken,
  });

  res.statusCode = 200;
  res.send({ message: 'The activation email was sent again' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await userService.getUserByActivationToken(activationToken);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest(
      `The account is not activated. Please check your mail.
      You should have received an email with an activation link`,
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const resetPasswordToken = uuidv4();

  await resetTokenService.create(user.id, resetPasswordToken);

  await emailService.sendResetPasswordEmail({ email, resetPasswordToken });

  res.statusCode = 200;
  res.send({ message: 'The reset password email was sent' });
};

const saveNewPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const token = await resetTokenService.getByResetToken(resetToken);

  if (!token) {
    throw ApiError.badRequest(
      `You may have missed some steps when changing your password.
      Please start from the beginning`,
    );
  }

  const now = new Date();

  if (now > token.expiresAt) {
    await resetTokenService.remove(token.userId);

    throw ApiError.badRequest('Token has expired');
  }

  const errors = {
    password: validatePassword(password),
    confirmPassword: validatePassword(confirmPassword),
  };

  if (errors.password || errors.confirmPassword) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords must match');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.getUserById(token.userId);

  user.password = hashedPassword;
  user.save();

  await resetTokenService.remove(token.userId);

  res.send({ message: 'Password successfully changed' });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.getUserByEmail(userData.email);

  await generateTokens(res, user);
};

const changeName = async (req, res) => {
  const { id, newName } = req.body;

  const user = await userService.getUserById(id);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.name === newName) {
    throw ApiError.badRequest('The same names');
  }

  const error = validateName(newName);

  if (error) {
    throw ApiError.badRequest('Bad request', error);
  }

  user.name = newName;
  await user.save();

  const normalizedUser = userService.normalize(user);

  res.status(200);
  res.send({ user: normalizedUser });
};

const changeEmail = async (req, res) => {
  const { id, email, password, newEmail } = req.body;

  const user = await userService.getUserById(id);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const errors = {
    password: validatePassword(password),
    email: validateEmail(email),
    newEmail: validateEmail(newEmail),
  };

  if (errors.password || errors.email || errors.newEmail) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (newEmail === email) {
    throw ApiError.badRequest('Emails cannot be the same');
  }

  const userByEmail = await userService.getUserByEmail(email);

  if (!userByEmail) {
    throw ApiError.badRequest('There is no user with this email');
  }

  if (userByEmail.email !== user.email) {
    throw ApiError.badRequest('This is not your email address');
  }

  const userByNewEmail = await userService.getUserByEmail(newEmail);

  if (userByNewEmail) {
    throw ApiError.badRequest('This email is already being used');
  }

  const confirmNewEmailToken = uuidv4();

  await emailChangesService.create({
    userId: user.id,
    oldEmail: email,
    newEmail,
    confirmNewEmailToken,
  });

  await emailService.sendConfirmNewEmail({
    email,
    newEmail,
    confirmNewEmailToken,
  });

  await emailService.sendNotificationToOldEmail({ email, newEmail });

  res.statusCode = 200;
  res.send({ message: 'OK' });
};

const saveNewEmail = async (req, res) => {
  const { confirmNewEmailToken } = req.params;

  const changeEmailData =
    await emailChangesService.getByConfirmNewEmailToken(confirmNewEmailToken);

  if (!changeEmailData) {
    throw ApiError.badRequest('Wrong token to confirm the change of mail');
  }

  const now = new Date();

  if (now > changeEmailData.expiresAt) {
    throw ApiError.badRequest('Token has expired');
  }

  const user = await userService.getUserById(changeEmailData.userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.email = changeEmailData.newEmail;
  user.save();

  await generateTokens(res, user);
};

const changePassword = async (req, res) => {
  const { id, password, newPassword, confirmNewPassword } = req.body;

  const user = await userService.getUserById(id);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const errors = {
    password: validatePassword(password),
    newPassword: validatePassword(newPassword),
    confirmNewPassword: validatePassword(confirmNewPassword),
  };

  if (errors.password || errors.newPassword || errors.confirmNewPassword) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (newPassword !== confirmNewPassword) {
    throw ApiError.badRequest('Passwords must match');
  }

  const hashedNewPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPass;
  await user.save();

  res.status(200);
  res.send({ message: 'Password has been successfully updated' });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const authController = {
  register,
  sendActivation,
  activate,
  login,
  resetPassword,
  saveNewPassword,
  changeName,
  changeEmail,
  saveNewEmail,
  changePassword,
  logout,
  refresh,
};

module.exports = { authController };
