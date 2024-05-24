import { ApiError } from '../exeptions/apiError.js';
import userService from '../services/user.service.js';
import { validateName } from '../utils/validation.js';

const get = async (req, res) => {
  const user = await userService.getById(req.userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  res.send(userService.normalize(user));
};

const updateName = async (req, res) => {
  const { name } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (errors.name) {
    throw ApiError.BadRequest('validation error', errors);
  }

  const user = await userService.updateName(req.userId, name);

  res.status(200).send(userService.normalize(user));
};

export default {
  get,
  updateName,
};
