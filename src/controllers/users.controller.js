import { StatusCodes } from 'http-status-codes';
import { usersService } from '../services/users.service.js';

async function getAllUsers(_, res) {
  const users = await usersService.getAll();

  return res.status(StatusCodes.OK).send(users);
}

export const usersController = {
  getAllUsers,
};
