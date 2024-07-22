import { sendActivationMail } from '../services/mail-service.js';
import {
  consumeActivationToken,
  createUser,
  findActivatedUserByEmail,
  findUserByActivationToken,
  findUserByEmail,
} from '../services/auth-service.js';
import { ApiError } from '../exceptions/API-error.js';
import { validateRegistrationData } from '../utils/validation.js';
import { compareUserPasswords } from './users-controller.js';
import {
  createAccessToken,
  createRefreshToken,
  readRefreshToken,
} from '../services/jwt-service.js';
import { tokenService } from '../services/token-service.js';

export const authController = {
  async register(req, res, next) {
    const { name, email, password } = req.body;

    const validationErrors = validateRegistrationData(name, email, password);

    if (!!validationErrors) {
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

    res.send(newUser);
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

    res.sendStatus(204);
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
      user: { email: publicUserData.email },
    });
  },

  async refresh(req, res, next) {
    const { refreshToken } = req.cookies;

    // Check whether the token has ever been valid
    const publicUserData = readRefreshToken(refreshToken);

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
};
