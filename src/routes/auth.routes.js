'use strict';

const { Router } = require('express');

const { requireGuest } = require('../middleware/auth.middleware');
const Auth = require('../controllers/auth.controller');

const r = Router();

r.get('/register', requireGuest, Auth.getRegister);
r.post('/register', requireGuest, Auth.postRegister);

r.get('/activate', requireGuest, Auth.getActivate);

r.get('/login', requireGuest, Auth.getLogin);
r.post('/login', requireGuest, Auth.postLogin);

r.get('/password/forgot', requireGuest, Auth.getForgot);
r.post('/password/forgot', requireGuest, Auth.postForgot);
r.get('/password/reset', requireGuest, Auth.getReset);
r.post('/password/reset', requireGuest, Auth.postReset);

module.exports = r;
