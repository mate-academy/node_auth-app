const express = require('express');
const { getAllActivated } = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const usersRouter = new express.Router();

usersRouter.get('/', authMiddleware, catchError(getAllActivated));

module.exports = usersRouter;
