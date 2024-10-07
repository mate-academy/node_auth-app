import { User } from '../models/User.model.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

const validateEmail = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Bad Request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'Ok, registration completed successfully' });
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

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.Unauthorized();
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.Unauthorized();
  }

  await tokenService.removeByUserId(userData.id);
  res.sendStatus(204);
};

async function generateTokens(res, user) {
  const normolizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normolizedUser);
  const refreshAccessToken = jwtService.signRefresh(normolizedUser);

  await tokenService.save(normolizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: normolizedUser,
    accessToken,
  });
}

async function resetPassword(req, res) {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const normolizedUser = userService.normalize(user);
  const resetToken = jwtService.signReset(normolizedUser);
  const href = `${process.env.CLIENT_HOST}/resetPassword/${resetToken}`;
  const html = `
    <h1>Resetting password</h1>
    <p>If you want to reset your password, click on this link:</p>
    <p>
      <a href="${href}">${href}</a>
    </p>
  `;

  await emailService.send({
    email: normolizedUser.email,
    subject: 'Resetting password',
    html,
  });

  res.status(200).send({
    message: `For resetting your password, check your email.
       A notification has been sent to your old email.
      `,
  });
}

const reset = async (req, res) => {
  const { resetToken } = req.params;
  const userData = jwtService.verify(resetToken);

  if (!userData) {
    throw ApiError.BadRequest('Invalid or expired reset token');
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  res.status(200).send(`
    Enter your new password on '/updatePassword' endpoint
`);
};

async function updatePassword(req, res) {
  const { resetToken, password, confirmPassword } = req.body;

  const userData = jwtService.verify(resetToken);

  if (!userData) {
    throw ApiError.BadRequest('Invalid or expired reset token');
  }

  if (password !== confirmPassword) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.findByEmail(userData.email);

  user.password = hashedPassword;
  await user.save();

  res
    .status(200)
    .send('Password successfully reset. <a href="/login">Login</a>');
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  validatePassword,
  validateEmail,
  resetPassword,
  reset,
  updatePassword,
};
