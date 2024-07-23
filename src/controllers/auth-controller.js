import {
  sendActivationMail,
  sendResetMail,
  sendResetMailConfirmation,
} from '../services/mail-service.js';
import {
  consumeActivationToken,
  createUser,
  findActivatedUserByEmail,
  findUserByActivationToken,
  findUserByEmail,
  updatePassword,
} from '../services/auth-service.js';
import { ApiError } from '../exceptions/API-error.js';
import {
  validatePassword,
  validateRegistrationData,
} from '../utils/validation.js';
import { compareUserPasswords } from './users-controller.js';
import {
  createAccessToken,
  createResetToken,
  createRefreshToken,
  verifyResetToken,
  verifyRefreshToken,
} from '../services/jwt-service.js';
import { tokenService } from '../services/token-service.js';
import { resetService } from '../services/reset-service.js';

export const authController = {
  async register(req, res, next) {
    const { name, email, password } = req.body;

    const validationErrors = validateRegistrationData(name, email, password);

    if (validationErrors) {
      throw ApiError.BadRequest('Incorrect data', validationErrors);
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser !== null) {
      throw ApiError.BadRequest('User already exists', {
        email: 'This email is already in use',
      });
    }

    const newUser = await createUser(name, email, password);

    if (!newUser) {
      next(new ApiError(400, 'Could not create the user'));
    }

    await sendActivationMail(email, newUser.activationToken);

    const newUserPublicData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      activationToken: newUser.activationToken,
    };

    res.send(newUserPublicData);
  },

  async activate(req, res, next) {
    const { activationToken } = req.params;

    const publicUserData = await findUserByActivationToken(activationToken);

    if (!publicUserData) {
      next(ApiError.BadRequest('Wrong activation link'));
    }

    consumeActivationToken(publicUserData);

    res.send(publicUserData);
  },

  async login(req, res) {
    const { email, password } = req.body;

    const activeUser = await findActivatedUserByEmail(email);

    if (!activeUser) {
      throw ApiError.BadRequest('User does not exist or password is incorrect');
    }

    const arePasswordsEqual = await compareUserPasswords(activeUser, password);

    if (!arePasswordsEqual) {
      throw ApiError.BadRequest('User does not exist or password is incorrect');
    }

    const publicUserData = {
      id: activeUser.id,
      name: activeUser.name,
      email: activeUser.email,
    };

    await authController.sendAuth(res, publicUserData);
  },

  async logout(req, res) {
    const { refreshToken } = req.cookies;

    const userData = await tokenService.getByToken(refreshToken);

    if (userData) {
      // Delete the Refresh Token from DB
      await tokenService.deleteTokenByUserId(userData.UserId);
    }

    res.clearCookie('refreshToken');

    res.sendStatus(204);
  },

  async sendAuth(res, publicUserData) {
    const accessToken = createAccessToken(publicUserData);
    const refreshToken = createRefreshToken(publicUserData);

    // Save the token in cookies
    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    await tokenService.saveToken(publicUserData.id, refreshToken);

    res.send({
      accessToken: accessToken,
      user: {
        name: publicUserData.name,
        email: publicUserData.email,
      },
    });
  },

  async refresh(req, res, next) {
    const { refreshToken } = req.cookies;

    const publicUserData = verifyRefreshToken(refreshToken);

    if (publicUserData === null) {
      throw ApiError.Unauthorized();
    }

    // Check in DB whether the refresh token is still valid
    const token = await tokenService.getByToken(refreshToken);

    if (token === null) {
      throw ApiError.Unauthorized();
    }

    await authController.sendAuth(res, publicUserData);
  },

  async resetRequest(req, res, next) {
    const { email } = req.body;

    // Check whether user with that email exists
    const user = await findActivatedUserByEmail(email);

    if (!user) {
      throw ApiError.BadRequest('Invalid email', { email: 'Incorrect email' });
    }

    const ResetToken = createResetToken(user);

    // Store a ResetToken in the DB (on User's record)
    await resetService.saveToken(user, ResetToken);

    await sendResetMail(email, ResetToken);

    res.status(200).send({ message: 'Reset email has been set' });
  },

  async resetPassword(req, res, next) {
    const { resetToken } = req.params;
    const { email, password, confirmation } = req.body;

    if (!resetToken) {
      throw ApiError.BadRequest('Incorrect token', {
        resetToken: 'No reset token provided',
      });
    }

    if (!password) {
      throw ApiError.BadRequest('Incorrect data', {
        password: 'No password provided',
      });
    }

    const passwordErrors = validatePassword(password);

    if (passwordErrors) {
      throw ApiError.BadRequest('Incorrect password', {
        password: 'passwordErrors',
      });
    }

    if (!confirmation) {
      throw ApiError.BadRequest('Incorrect data', {
        confirmation: 'No confirmation provided',
      });
    }

    if (password !== confirmation) {
      throw ApiError.BadRequest('Incorrect data', {
        confirmation: `Passwords don't match`,
      });
    }

    if (!email) {
      throw ApiError.BadRequest('Incorrect data', {
        email: 'No email provided',
      });
    }

    // Check whether reset token is valid (with jwt)
    const publicUserData = verifyResetToken(resetToken);

    if (!publicUserData) {
      throw ApiError.BadRequest('Incorrect token', {
        resetToken: 'Incorrect or expired reset token.',
      });
    }

    // Check who does the token belong to (which user)
    const user = await findActivatedUserByEmail(email);

    if (!user) {
      throw ApiError.BadRequest('Incorrect data', {
        email: 'Incorrect email address',
      });
    }

    // Check whether the token belongs to the user of that email
    if (publicUserData.id !== user.id) {
      throw ApiError.Unauthorized();
    }

    await updatePassword(user.id, password);

    await resetService.deleteResetTokenByUserId(user.id);

    await sendResetMailConfirmation(email);

    res.sendStatus(200);
  },
};
