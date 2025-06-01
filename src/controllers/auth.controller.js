/* eslint-disable no-console */
import axios from 'axios';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { nanoid } from 'nanoid';
import { Op } from 'sequelize';
import { ApiError } from '../exceptions/api.error.js';
import { ResetToken } from '../models/resetToken.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { generateTokens } from '../utils/generateTokens.js';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const registration = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', 400, errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.registration(firstName, lastName, email, hashedPassword);

  res.send({ message: 'Activation email was sent!' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your account first');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verify(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');

  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest(emailError);
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    return res.send({
      message: 'Password reset link sent if account exists',
    });
  }

  const resetToken = nanoid(32);

  const expiresAt = new Date(Date.now() + 3600000);

  await ResetToken.destroy({ where: { userId: user.id } });

  await ResetToken.create({
    resetToken: resetToken,
    expiresAt,
    userId: user.id,
  });

  await emailService.sendEmailChangeConfirmation(user.email, resetToken);

  return res.send({
    message: 'Password reset link sent if account exists',
  });
};

const confirmPasswordReset = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest(passwordError);
  }

  const resetTokenRecord = await ResetToken.findOne({
    where: {
      resetToken,
      expiresAt: {
        [Op.gt]: new Date(),
      },
      used: false,
    },
    include: { model: User, required: true },
  });

  if (!resetTokenRecord || resetTokenRecord.used) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const user = resetTokenRecord.user;

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  resetTokenRecord.resetToken = null;
  resetTokenRecord.resetTokenExpiry = null;
  resetTokenRecord.used = true;
  await resetTokenRecord.save();
  await user.save();

  return res.send({ message: 'Password has been reset successfully' });
};

const googleSignIn = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw ApiError.badRequest('Google credential is required');
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw ApiError.badRequest('Invalid Google credential');
    }

    let user = await userService.findByEmail(payload.email);

    if (!user) {
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';
      const email = payload.email;

      const randomPassword = nanoid(32);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await userService.registration(
        firstName,
        lastName,
        email,
        hashedPassword,
        true,
      );
    }

    await generateTokens(res, user);
  } catch (error) {
    throw ApiError.badRequest('Failed to authenticate with Google');
  }
};

const githubSignIn = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw ApiError.badRequest('Git Hub credential is required');
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const { access_token: accessToken } = tokenResponse.data;

    if (!accessToken) {
      throw ApiError.unauthorized('GitHub token exchange failed');
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const emailResponse = await axios.get(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      },
    );

    console.log({ accessToken, userResponse, emailResponse });

    const githubUser = userResponse.data;

    const primaryEmail = emailResponse.data.find(
      (e) => e.primary && e.verified,
    )?.email;

    let user = await userService.findByEmail(primaryEmail);

    if (!user) {
      const [firstName, ...lastArr] = (
        githubUser.name ||
        githubUser.login ||
        'GitHubUser'
      ).split(' ');

      const lastName = lastArr.join(' ') || '';
      // const hashedPassword = await bcrypt.hash(nanoid(32), 10);

      // console.log('USER RESPONSE', {
      //   firstName,
      //   lastName,
      //   hashedPassword,
      //   lastArr,
      // });

      user = await userService.registration(firstName, lastName);
    }

    if (!primaryEmail) {
      throw ApiError.badRequest(
        'GitHub account must have a verified primary email',
      );
    }
  } catch (error) {
    console.error(
      'GitHub sign is error:',
      error.response?.data || error.message,
    );
  }
};

export const authController = {
  registration,
  activate,
  login,
  logout,
  refresh,
  requestPasswordReset,
  confirmPasswordReset,
  googleSignIn,
  githubSignIn,
};
