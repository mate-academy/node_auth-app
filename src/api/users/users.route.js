import express from 'express';
const { Router } = express;
import * as usersController from './users.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { catchError } from '../../utils/catchError.js';

const users = Router();

users.get('/', authMiddleware, catchError(usersController.getAll));
users.get('/:id', authMiddleware, catchError(usersController.getOne));
users.post('/', authMiddleware, catchError(usersController.create));
users.delete('/:id', authMiddleware, catchError(usersController.deleteOne));
users.patch('/:id', authMiddleware, catchError(usersController.update));

export default users;
