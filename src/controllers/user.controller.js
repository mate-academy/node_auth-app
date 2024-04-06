require('dotenv/config');

const { ApiError } = require('../exeptions/apiError');
const validators = require('../helpers/validators');
const userService = require('../services/user.service.js');

const update = async (req, res) => {
  const { id, name, email, password } = req.body;

  const error = {
    name: validators.validateName(name),
    email: !email ? null : validators.validateEmail(email),
    password: !password ? null : validators.validatePassword(password),
  };

  if (error.email || error.name || error.password || !id) {
    throw ApiError.badRequest('Bad request', error);
  }

  const result = await userService.update({
    id,
    name,
    email,
    password,
  });

  if (!result) {
    res.sendStatus(501);

    return;
  }

  res.sendStatus(204);
};

module.exports = {
  update,
};
