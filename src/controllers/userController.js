'use strict';

import userService from '../services/userService.js';

const getAll = async(req, res) => {
  const users = await userService.getAllActive();
  const normalizedUsers = users.map(userService.normalize);

  res.status(200).send(normalizedUsers);
};

export default { getAll };
