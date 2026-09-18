const { User } = require('../model/user.model');

const bcrypt = require('bcrypt');

const authService = require('../service/auth.service');
const emailService = require('../service/email.service');
const userService = require('../service/user.service');

const jwt = require('../utils/jwt');

const salt = 10;

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const activationToken = crypto.randomUUID();

  const user = await userService.findUserByParam({ where: { email } });

  if (user) {
    res.status(400).json({ message: 'User is exist with your Email' });

    return;
  }

  const errors = {
    email: authService.validateEmail(email),
    password: authService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  const normUser = userService.normalize(newUser);

  await emailService.sendActivationLink(email, activationToken);

  return authenticateUser(res, normUser);
};

const activate = async (req, res) => {
  const { token } = req.params;

  const foundUser = await userService.findUserByParam({
    where: { activationToken: token },
  });

  if (!foundUser || foundUser.activationToken !== token) {
    res.status(404).json({ message: 'Not found' });

    return;
  }

  const updatedUser = await foundUser.update({ activationToken: null });

  return authenticateUser(res, userService.normalize(updatedUser));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const registeredUser = await userService.findUserByParam({
    where: { email },
  });

  if (!registeredUser) {
    res.status(404).json({ message: 'User not exist' });

    return;
  }

  if (!registeredUser.password) {
    res.status(200).json({
      message: 'Please login with Google, FaceBook or GitHub',
    });

    return;
  }

  if (!(await bcrypt.compare(password, registeredUser.password))) {
    res.status(401).json({ message: 'Your password is incorrect' });

    return;
  }

  if (registeredUser.activationToken !== null) {
    res.status(200).json({ message: 'Please activate your email' });

    return;
  }

  const normUser = userService.normalize(registeredUser);

  return authenticateUser(res, normUser);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const dataUser = await jwt.validateRefreshToken(refreshToken);

  if (!dataUser) {
    res.status(204).end();

    return;
  }

  await authService.removeRefreshToken(dataUser.id);
  res.clearCookie('refreshToken');

  res.status(204).end();
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(200).json({ message: 'User is not exist' });

    return;
  }

  const user = await userService.findUserByParam({ where: { email } });

  if (!user) {
    res.status(200).json({ message: 'User is not exist' });

    return;
  }

  const token = crypto.randomUUID();

  await userService.updateUser(user.id, {
    resetPasswordToken: token,
  });

  try {
    await emailService.sendResetPasswordLink(email, token);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset password email' });

    return;
  }

  res.status(200).json({ message: 'Password reset email sent' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'password incorrect' });

    return;
  }

  const user = await userService.findUserByParam({
    where: { resetPasswordToken: resetToken },
  });

  if (!user) {
    res.status(404).json({ message: 'user not found' });

    return;
  }

  const newPassword = await bcrypt.hash(password, salt);

  await userService.updateUser(user.id, {
    resetPasswordToken: null,
    password: newPassword,
  });

  res.status(200).json({ message: 'password is changed' });
};

const oauthCallback = async (req, res) => {
  const normUser = userService.normalize(req.user);
  const { accessToken, refreshToken } =
    await authService.updateTokens(normUser);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  const redirectUrl = new URL('/pages/oauth-callback', process.env.CLIENT_URL);

  redirectUrl.searchParams.set('accessToken', accessToken);

  res.redirect(redirectUrl.toString());
};

const authenticateUser = async (res, dataUser) => {
  const { user, accessToken, refreshToken } =
    await authService.updateTokens(dataUser);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: user,
    accessToken,
  });
};

module.exports = {
  register,
  activate,
  login,
  logout,
  forgotPassword,
  resetPassword,
  oauthCallback,
};
