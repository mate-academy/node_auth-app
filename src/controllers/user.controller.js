'use strict';

const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.js');
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const tokenService = require('../services/token.service.js');
const emailService = require('../services/email.service.js');

const getAllActivated = async(req, res) => {
  try {
    const users = await userService.getAllActivated();

    res.send(users.map(userService.normalize));
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const changeName = async(req, res) => {
  try {
    const { userId } = req.params;
    const { newName } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.badRequest('Invalid user data');
    }

    user.name = newName;
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const updatePassword = async(req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { password, newPassword } = req.body;

    if (!password || password.length < 6 || password === newPassword) {
      throw ApiError.BadRequest('Invalid password', {
        password: 'Invalid password',
      });
    }

    const userData = jwtService.verifyRefresh(refreshToken);
    const user = await userService.findActiveUser(userData.email);

    await userService.checkPassword(password, user);
    await userService.updatePassword(user, newPassword);

    res.send({ message: 'Successfully changed password' });
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

const updateEmail = async(req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { password, newEmail } = req.body;

    const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

    if (!emailPattern.test(newEmail)) {
      throw ApiError.BadRequest('Invalid email', { email: 'Invalid email' });
    }

    const userData = jwtService.verifyRefresh(refreshToken);
    const user = await userService.findActiveUser(userData.email);

    await userService.checkPassword(password, user);

    const activationToken = jwtService.generateToken();
    const oldEmail = user.email;

    await Promise.all([
      userService.updateEmail(user, newEmail, activationToken),
      tokenService.remove(user.id),
      emailService.sendActivationEmail(newEmail, activationToken),
      emailService.sendChangeMail(oldEmail),
    ]);

    res.clearCookie('refreshToken');

    res.send({
      message:
        'Email changed! Check your new email to activate your account!',
    });
  } catch (error) {
    res.status(400).send({ error: 'Bad Request' });
  }
};

module.exports = {
  getAllActivated,
  changeName,
  updatePassword,
  updateEmail,
};
