import { sendActivationMail, sendResetMail } from '../services/mail-service.js';
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

    // User stripped of password attribute, so we don't send it in the response
    const publicUserData = await findUserByActivationToken(activationToken);

    if (!publicUserData) {
      next(ApiError.BadRequest('Wrong activation link'));
    }

    // Found the user, change the field to null
    consumeActivationToken(publicUserData);

    res.send(publicUserData);
  },

  async login(req, res) {
    const { email, password } = req.body;

    // find the user in db
    const activeUser = await findActivatedUserByEmail(email);

    if (!activeUser) {
      throw ApiError.BadRequest('User does not exist or password is incorrect');
    }

    const arePasswordsEqual = await compareUserPasswords(activeUser, password);

    if (!arePasswordsEqual) {
      throw ApiError.BadRequest('User does not exist or password is incorrect');
    }

    // Log in was successful

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

    res.cookie('refreshToken', null, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.status(204);
    res.redirect('/');
  },

  async sendAuth(res, publicUserData) {
    // generate access token
    const accessToken = createAccessToken(publicUserData);
    const refreshToken = createRefreshToken(publicUserData);

    // Save the token in cookies
    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    // Save the refresh token in the DB
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

    // Check whether the token has ever been valid
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

  // Password reset
  async resetRequest(req, res, next) {
    const { email } = req.body;

    // Check whether user with that email exists
    const user = await findActivatedUserByEmail(email);

    if (!user) {
      throw ApiError.BadRequest(
        `Account with that email address doesn't exist or the account has not yet been activated`,
      );
    }

    // Create a ResetToken
    const ResetToken = createResetToken(user);

    // Store a ResetToken in the DB (on User's record)
    await resetService.saveToken(user, ResetToken);

    // Send the password reset email with the reset link (include the token)
    await sendResetMail(email, ResetToken);

    // Send the status (with info that "Reset email has been set")
    res.status(200).send({ message: 'Reset email has been set' });
  },

  async resetPassword(req, res, next) {
    // Get the reset token
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

    // Change the password
    await updatePassword(user.id, password);

    // Remove the resetToken from the User's record
    await resetService.deleteResetTokenByUserId(user.id);

    // Send a success message
    res.sendStatus(200);
  },
};
