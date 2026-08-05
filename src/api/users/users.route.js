import express from 'express';
const { Router } = express;
import * as usersController from './users.controller.js';

const users = Router();

users.get('/', usersController.getAll);
users.get('/:id', usersController.getOne);
users.post('/', usersController.create);
users.delete('/:id', usersController.deleteOne);
users.patch('/:id', usersController.update);

export default users;
