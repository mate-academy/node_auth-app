'use strict';

const serviceUser = require('./../service/users.service.js');
const bcrypt = require('bcrypt');
const { mailer } = require('./../util/mailer.js');

const getAllUsers = async (req, res) => {
  try {
    const users = await serviceUser.getAllUsers();

    res.statusCode = 200;
    res.send(users);
  } catch (err) {
    return res.status(500).send({ error: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = Number(req.user.userId);
    const user = await serviceUser.getUserById(id);

    if (!user) {
      return res.status(404).send('User with this id does not exist');
    }

    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send({ error: 'Internal server error' });
  }
};

const updateUserName = async (req, res) => {
  try {
    const id = Number(req.user.userId);

    if (Number.isNaN(id)) {
      return res.status(400).send('Invalid id');
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send('Empty body');
    }

    const { name } = req.body;

    if (typeof name !== 'string' || !name || !name.trim()) {
      return res.status(400).send('Invalid name');
    }

    await serviceUser.updateUserName(id, name);

    const updatedUser = await serviceUser.getUserById(id);

    return res.status(200).send(updatedUser);
  } catch (err) {
    return res.status(500).send({ error: 'Internal server error' });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const id = Number(req.user.userId);
    const { oldPassword, newPassword, confirmation } = req.body;
    const passwordError = serviceUser.validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        errors: { password: passwordError },
        message: 'Validation error',
      });
    }

    if (Number.isNaN(id)) {
      return res.status(400).send('Invalid id');
    }

    if (newPassword !== confirmation) {
      return res.status(400).send('Password is wrong');
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send('Empty body');
    }

    const user = await serviceUser.getUserById(id);
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(401).send('Incorrect old password');
    }

    user.password = bcrypt.hashSync(newPassword, 10);

    await serviceUser.updateUserPassword(id, user.password);

    const updatedUser = await serviceUser.getUserById(id);

    return res.status(200).send(updatedUser);
  } catch (err) {
    return res.status(500).send({ error: 'Internal server error' });
  }
};

const updateUserEmail = async (req, res) => {
  try {
    const { password, newEmail, confirmation } = req.body;
    const id = Number(req.user.userId);

    if (!newEmail || !confirmation) {
      return res.status(400).send('Data is required');
    }

    if (newEmail !== confirmation) {
      return res.status(400).send('Confirmation do not match');
    }

    const user = await serviceUser.getUserById(id);
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).send('Wrong password');
    }

    const oldEmail = user.email;

    user.email = newEmail;

    await serviceUser.updateUserEmail(id, newEmail);

    const updatedUser = await serviceUser.getUserById(id);

    await mailer.sendChangeEmailNotification(oldEmail, newEmail);

    return res.status(200).send(updatedUser);
  } catch (err) {
    return res.status(500).send({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserName,
  updateUserPassword,
  updateUserEmail,
};
