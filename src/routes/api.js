const express = require('express');
const { usersRoute } = require('./usersRoute');
const { catchError } = require('../utils/catchError');

const api = express.Router();

api.use('/users', catchError(usersRoute));

module.exports = api;
