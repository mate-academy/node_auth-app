'use strict';

const bcrypt = require('bcrypt');
const userService = require('../services/userService');
const authController = require('../controllers/authController');
const { ApiError } = require('../exceptions/apiError');

const getAll = async(req, res, next) => {
  const users = await userService.getAllActive();

  res.send(
    users.map(userService.normalize)
  );
};

const update = async(req, res, next) => {
  const { id } = req.params;
  const {
    name,
    email,
    currentPassword,
    newPassword,
    repeatPassword,
  } = req.body;

  const foundUser = await userService.getById(id);

  if (!foundUser) {
    res.sendStatus(404);

    return;
  }

  foundUser.name = name;

  if (foundUser.email !== email) {
    const isPasswordValid = await bcrypt.compare(
      currentPassword, foundUser.password
    );

    if (!isPasswordValid) {
      throw ApiError.BadRequest('Password is wrong');
    };

    if (authController.validateEmai(email)) {
      throw ApiError.BadRequest(authController.validateEmai(email));
    }

    foundUser.email = email;
    await foundUser.destroy();

    await userService.register(
      email,
      currentPassword,
      name
    );
  }

  if (newPassword && repeatPassword) {
    const isPasswordValid = await bcrypt.compare(
      currentPassword, foundUser.password
    );

    if (!isPasswordValid) {
      throw ApiError.BadRequest('Password is wrong');
    };

    if (newPassword !== repeatPassword) {
      throw ApiError.BadRequest('Passwords is mismatch');
    }

    foundUser.password = await bcrypt.hash(newPassword, 10);
  }

  await foundUser.save();
  res.send(userService.normalize(foundUser));
};

module.exports = {
  getAll,
  update,
};
