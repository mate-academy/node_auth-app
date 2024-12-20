const express = require('express');

const { authMiddleware } = require('../middlewares/authMiddleware');

const { usersControllers } = require('../controllers/users.controller');

const router = express.Router();

router.use('/', authMiddleware);
router.get('/', usersControllers.getUsers);
router.put('/:id', usersControllers.updateUser);

module.exports = { usersRouter: router };
