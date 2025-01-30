import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { emailService } from '../services/email.service.js';
import { dataValidationService } from '../services/dataValidation.service.js';

const getUserData = async (req, res) => {
  const {
    newName,
    password,
    newPassword,
    confirmation,
    email,
    newEmail,
    newEmailConfirmation,
  } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Couldnt find such user');
  }

  if (newName) {
    // console.log('Changing user name');

    const invalidName = dataValidationService.validateName(newName);

    if (invalidName) {
      throw ApiError.badRequest('Name didnt match required pattern');
    }

    user.name = newName;
    await user.save();
  }

  if (newPassword) {
    // console.log('Changing password');

    const invalidPassword = dataValidationService.validatePassword(newPassword);

    if (invalidPassword) {
      throw ApiError.badRequest('Password didnt match required pattern');
    }

    if (user.password !== password) {
      throw ApiError.badRequest(
        'Passed password is not equal to an old password',
      );
    }

    if (newPassword !== confirmation || !confirmation) {
      throw ApiError.badRequest('New password and confirmation are not equal');
    }

    user.password = newPassword;
    await user.save();
    // console.log('Password successfully changed');
  }

  if (newEmail) {
    // console.log('Changing email');

    const invalidEmail = dataValidationService.validateEmail(newEmail);

    if (invalidEmail) {
      throw ApiError.badRequest('Email didnt match required pattern');
    }

    if (user.password !== password) {
      throw ApiError.badRequest('You cant change email, wrong password');
    }

    if (newEmail !== newEmailConfirmation || !newEmailConfirmation) {
      throw ApiError.badRequest('New email and its confirmation are not equal');
    }

    user.email = newEmail;

    await emailService.changeEmailNotification(email, newEmail);
    await emailService.notifyNewEmail(newEmail);
    await user.save();
    // console.log('Email successfully changed');
  }

  res.sendStatus(200);
};

export const userController = {
  getUserData,
};
