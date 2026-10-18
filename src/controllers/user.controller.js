import * as userService from '../services/user.service.js';

export const getAll = async (req, res) => {
  const users = await userService.getAll();

  if (!users) {
    res.sendStatus(500);

    return;
  }

  res.send(users);
  res.sendStatus(200);
};

export const getById = async (req, res) => {
  const { id } = req.params.id;
  const user = await userService.getById(id);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  res.send(user);
  res.sendStatus(200);
};

export const getByEmail = async (req, res) => {
  const { email } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  res.send(user);
  res.sendStatus(200);
};

export const add = async (req, res) => {
  const { name, email, passwordHash } = req.body;
  const user = await userService.create({ name, email, passwordHash });

  if (!user) {
    res.sendStatus(400);

    return;
  }

  res.send(user);
};
