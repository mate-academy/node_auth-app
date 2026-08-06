import { ApiError } from '../../exceptions/api.error.js';
import * as usersService from './users.service.js';

export const getAll = async (req, res) => {
  // { activationToken: null } - filter only verified users
  const users = await usersService.getAll();

  res.send(users.map(usersService.normalize));
};

export const getOne = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.send(usersService.normalize(user));
};

export const create = async (req, res) => {
  if (!usersService.isValidParams(req.body)) {
    throw ApiError.badRequest();
  }

  const user = await usersService.create(req.body);

  res.status(201).send(usersService.normalize(user));
};

export const deleteOne = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await usersService.deleteById(req.params.id);

  res.sendStatus(204);
};

export const update = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!req.body || !usersService.isValidParams(req.body)) {
    throw ApiError.badRequest();
  }

  const updatedUser = await usersService.update(req.params.id, req.body);

  res.send(usersService.normalize(updatedUser));
};
