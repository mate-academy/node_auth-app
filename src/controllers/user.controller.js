const { User } = require('../models/user');
const { sendActivationEmail } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');
const { getAllActivatedUsers, normalize } = require('../services/user.service');

const getAllActivated = async (req, res) => {
  const users = await getAllActivatedUsers();

  res.send(users.map(normalize));
};

module.exports = {
  getAllActivated,
};
