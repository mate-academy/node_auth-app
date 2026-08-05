import express from 'express';
const { Router } = express;
import * as usersController from './users.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const users = Router();

users.get('/', authMiddleware, usersController.getAll);
users.get('/:id', authMiddleware, usersController.getOne);
users.post('/', authMiddleware, usersController.create);
users.delete('/:id', authMiddleware, usersController.deleteOne);
users.patch('/:id', authMiddleware, usersController.update);

export default users;
