import * as usersService from './users.service.js';

export const getAll = async (req, res) => {
  try {
    // { activationToken: null } - filter only verified users
    const users = await usersService.getAll();

    res.send(users.map(usersService.normalize));
  } catch (err) {
    res.sendStatus(500);
  }
};

export const getOne = async (req, res) => {
  try {
    const user = await usersService.getOne(req.params.id);

    if (!user) {
      return res.sendStatus(404);
    }

    res.send(usersService.normalize(user));
  } catch (err) {
    res.sendStatus(500);
  }
};

export const create = async (req, res) => {
  if (!usersService.isValidParams(req.body)) {
    return res.sendStatus(400);
  }

  try {
    const user = await usersService.create(req.body);

    res.status(201).send(usersService.normalize(user));
  } catch (err) {
    res.sendStatus(500);
  }
};

export const deleteOne = async (req, res) => {
  try {
    const user = await usersService.getOne(req.params.id);

    if (!user) {
      return res.sendStatus(404);
    }

    await usersService.deleteById(req.params.id);

    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const update = async (req, res) => {
  try {
    const user = await usersService.getOne(req.params.id);

    if (!user) {
      return res.sendStatus(404);
    }

    if (!req.body || !usersService.isValidParams(req.body)) {
      return res.sendStatus(400);
    }

    const updatedUser = await usersService.update(req.params.id, req.body);

    res.send(usersService.normalize(updatedUser));
  } catch (err) {
    res.sendStatus(500);
  }
};
