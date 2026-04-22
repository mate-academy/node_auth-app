'use strict';

const userService = require('../services/user.service');
const socialAccountService = require('../services/socialAccount.service');

async function me(req, res, next) {
  try {
    const profile = await userService.getProfile(req.user.id);

    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword = '', newPassword = '' } = req.body;

    const message = await userService.changePassword({
      userId: req.user.id,
      oldPassword,
      newPassword,
    });

    res.json({ message });
  } catch (error) {
    next(error);
  }
}

async function changeName(req, res, next) {
  try {
    const { newName = '' } = req.body;

    await userService.changeName({ userId: req.user.id, newName });

    res.json({ message: 'Name changed successfully.' });
  } catch (error) {
    next(error);
  }
}

async function changeEmail(req, res, next) {
  try {
    const { password = '', newEmail = '' } = req.body;

    await userService.requestEmailChange({
      userId: req.user.id,
      password,
      newEmail,
    });

    res.json({
      message: 'Confirmation link sent to your new email address.',
    });
  } catch (error) {
    next(error);
  }
}

async function removeGithubAccount(req, res, next) {
  try {
    await socialAccountService.removeByUserAndProvider({
      userId: req.user.id,
      provider: socialAccountService.GITHUB_PROVIDER,
    });

    res.json({ message: 'GitHub account removed successfully.' });
  } catch (error) {
    next(error);
  }
}

// eslint-disable-next-line object-curly-newline
module.exports = {
  me,
  changePassword,
  changeName,
  changeEmail,
  removeGithubAccount,
};
