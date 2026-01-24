const userService = require('./../service/user.service.js');
const bcrypt = require('bcrypt');
const { mailer } = require('./../util/mailer.js');
const { jwt } = require('./../service/jwt.service.js');
const { uuid } = require('uuidv4');
const { User } = require('./../models/User.model.js');

async function sendAuthentification(res, user) {
  const userData = userService.normalizeUser(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);
  const normalizedUser = userService.normalizeUser(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = {
      email: userService.validateEmail(email),
      password: userService.validatePassword(password),
      name: userService.validateName(name),
    };

    if (Object.values(errors).some((error) => error)) {
      return res.status(400).json({
        errors,
        message: 'Validation error',
      });
    }

    const existingUser = await userService.findUser(email);

    if (existingUser) {
      return res.status(400).json({
        errors: { email: 'User with this email has already exist' },
        message: 'Validation error',
      });
    }

    const activationToken = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.registerUser(
      name,
      email,
      hashedPassword,
      activationToken,
    );

    await mailer.sendActivationLink(email, activationToken);

    res.status(201).json({
      user: userService.normalizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user || user.activationToken !== activationToken) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.accessToken = null;
  await user.save();

  res.redirect('/profile');
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const user = await userService.findUser(email);
  const isPasswordValid = await bcrypt.compare(password, user.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.activationToken !== null) {
    return res.status(403).json({ message: 'Please activate your email' });
  }

  sendAuthentification(res, user);
  res.redirect('/profile');
};

const refresh = (req, res) => {
  const { refreshToken } = req.cookies.refreshToken;

  if (!jwt.validateRefreshToken(refreshToken)) {
    return res.status(401);
  }

  sendAuthentification(res, jwt.validateRefreshToken(refreshToken));
};

const logout = (req, res) => {
  res.clearCookie('refreshToken').redirect('/login');
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await userService.findUser(email);

  if (!user) {
    return res.sendStatus(200);
  }

  const resetToken = uuid();

  user.resetToken = resetToken;

  await user.save();
  await mailer.sendResetPasswordNotification(email, resetToken);

  res.send({ message: 'Reset password' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  const passwordError = userService.validatePassword(password);

  if (!password || password !== confirmation) {
    return res.status(400).json({ message: 'Passwod does not match' });
  }

  if (passwordError) {
    return res.status(400).json({
      errors: { password: passwordError },
      message: 'Validation error',
    });
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    return res.status(400).json({ message: 'No user with such token' });
  }

  user.password = bcrypt.hashSync(password, 10);
  user.resetToken = null;

  await userService.updateUserPassword(user.id, user.password);

  res.send({ message: 'Password was changed' });
};

module.exports = {
  register,
  loginUser,
  activate,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
