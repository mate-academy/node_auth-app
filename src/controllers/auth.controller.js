const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const emailService = require('../services/email.service');

const { validatePassword } = require('../utils/password');
const { validateEmail } = require('../utils/email');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({
      message: 'Name, email and password are required',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).send({
      message: 'Invalid email',
    });
  }

  const passwordErrors = validatePassword(password);

  if (passwordErrors.length) {
    return res.status(400).send({
      message: 'Password does not meet requirements',
      errors: passwordErrors,
    });
  }

  const existingUser = await authService.findByEmail(email);

  if (existingUser) {
    return res.status(400).send({
      message: 'User with this email already exists',
    });
  }

  const user = await authService.createUser({
    name,
    email,
    password,
  });

  await emailService.sendActivationEmail(user.email, user.activationToken);

  return res.status(201).send({
    message: 'Registration successful. Please check your email.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
};

const activate = async (req, res) => {
  const { token } = req.params;

  const user = await authService.findByActivationToken(token);

  if (!user) {
    return res.status(404).send({
      message: 'Invalid activation token',
    });
  }

  await authService.activateUser(user);

  const accessToken = tokenService.generateAccessToken(user);

  return res.status(200).send({
    message: 'Email activated successfully',
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: 'Email and password are required',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).send({
      message: 'Invalid email',
    });
  }

  const user = await authService.findByEmail(email);

  if (!user) {
    return res.status(401).send({
      message: 'Invalid email or password',
    });
  }

  const isPasswordCorrect = await authService.checkPassword(
    password,
    user.password,
  );

  if (!isPasswordCorrect) {
    return res.status(401).send({
      message: 'Invalid email or password',
    });
  }

  if (!user.isActive) {
    return res.status(403).send({
      message: 'Please activate your email',
    });
  }

  const accessToken = tokenService.generateAccessToken(user);

  return res.status(200).send({
    message: 'Login successful',
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

const logout = (req, res) => {
  return res.status(200).send({
    message: 'Logout successful',
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({
      message: 'Email is required',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).send({
      message: 'Invalid email',
    });
  }

  const user = await authService.findByEmail(email);

  if (!user) {
    return res.status(200).send({
      message: 'If this email exists, a reset link has been sent',
    });
  }

  const resetToken = await authService.createPasswordResetToken(user);

  await emailService.sendPasswordResetEmail(user.email, resetToken);

  return res.status(200).send({
    message: 'Password reset email sent',
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (!password || !confirmation) {
    return res.status(400).send({
      message: 'Password and confirmation are required',
    });
  }

  if (password !== confirmation) {
    return res.status(400).send({
      message: 'Passwords do not match',
    });
  }

  const passwordErrors = validatePassword(password);

  if (passwordErrors.length) {
    return res.status(400).send({
      message: 'Password does not meet requirements',
      errors: passwordErrors,
    });
  }

  const user = await authService.findByResetToken(token);

  if (!user) {
    return res.status(404).send({
      message: 'Invalid reset token',
    });
  }

  await authService.resetPassword(user, password);

  return res.status(200).send({
    message: 'Password reset successfully',
  });
};

module.exports = {
  register,
  activate,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
