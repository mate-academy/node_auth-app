const express = require('express');
const {
  controller: roomsController,
} = require('../controllers/rooms.controller');
const { catchError } = require('../utils/catchError');
const { roomOwnerMiddleware } = require('../middlewares/owner.middleware');

const router = express.Router();

router.get('/', catchError(roomsController.getAll));

router.get('/:id', catchError(roomsController.getById));

router.post('/', catchError(roomsController.create));

router.delete('/:id', roomOwnerMiddleware, catchError(roomsController.delete));

router.patch('/:id', roomOwnerMiddleware, catchError(roomsController.update));

module.exports = { router };
