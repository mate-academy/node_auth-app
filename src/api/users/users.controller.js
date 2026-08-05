import * as usersService from './users.service.js';

export const getAll = async (req, res) => {
  // { activationToken: null } - filter only verified users
  const users = await usersService.getAll();

  res.send(users.map(usersService.normalize));
};

export const getOne = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    return res.sendStatus(404);
  }

  res.send(usersService.normalize(user));
};

export const create = async (req, res) => {
  if (!usersService.isValidParams(req.body)) {
    return res.sendStatus(400);
  }

  const user = await usersService.create(req.body);

  res.status(201).send(usersService.normalize(user));
};

export const deleteOne = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    return res.sendStatus(404);
  }

  await usersService.deleteById(req.params.id);

  res.sendStatus(204);
};

export const update = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    return res.sendStatus(404);
  }

  if (!req.body || !usersService.isValidParams(req.body)) {
    return res.sendStatus(400);
  }

  const updatedUser = await usersService.update(req.params.id, req.body);

  res.send(usersService.normalize(updatedUser));
};
