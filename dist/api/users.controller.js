import { usersRepository } from '../entity/users.repository.js';
import { userService } from '../services/user.service.js';
const getAll = async (req, res) => {
    const users = await usersRepository.getAllActive();
    res.json(users.map(userService.normalize));
};
export const usersController = {
    getAll,
};
