import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { userService } from '../services/userService.js';
import { ApiError } from '../exceptions/ApiError.js';

async function getProfile(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;

    const user = await userService.getByEmail(email);

    response.render('profile', { user, error: null });
  } catch (error) {
    next(error);
  }
}

async function updateName(
  request: ExpressRequest,
  response: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;
    const { name } = request.body;

    await userService.updateProfile({ email, name });
    response.redirect('/user/profile');
  } catch (error) {
    const { email } = request.user!;
    const user = await userService.getByEmail(email);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update name';

    response.render('profile', {
      user,
      error: errorMessage,
    });
  }
}

async function updatePassword(
  request: ExpressRequest,
  response: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;
    const { newPassword, oldPassword, confirmation } = request.body;

    if (newPassword !== confirmation) {
      const user = await userService.getByEmail(email);

      return response.render('profile', {
        user,
        error: 'Passwords do not match',
      });
    }

    await userService.updateProfile(
      { email, password: oldPassword },
      newPassword,
    );
    response.redirect('/user/profile');
  } catch (error: unknown) {
    const { email } = request.user!;
    const user = await userService.getByEmail(email);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update password';

    response.render('profile', {
      user,
      error: errorMessage,
    });
  }
}

async function updateEmail(
  request: ExpressRequest,
  response: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  try {
    if (!request.user) {
      throw ApiError.Unauthorized();
    }

    const { email } = request.user;
    const { password, newEmail } = request.body;

    await userService.updateProfile({ email, password }, undefined, newEmail);

    response.redirect('/user/profile');
  } catch (error: unknown) {
    const { email } = request.user!;
    const user = await userService.getByEmail(email);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update email';

    response.render('profile', {
      user,
      error: errorMessage,
    });
  }
}

export const userController = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
