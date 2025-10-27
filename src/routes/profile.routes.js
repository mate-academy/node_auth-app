'use strict';

const { Router } = require('express');

const { requireAuth } = require('../middleware/auth.middleware');
const Profile = require('../controllers/profile.controller');

const r = Router();

r.get('/profile', requireAuth, Profile.getProfile);
r.patch('/profile/name', requireAuth, Profile.patchName);
r.patch('/profile/password', requireAuth, Profile.patchPassword);
r.patch('/profile/email', requireAuth, Profile.patchEmail);

r.post('/logout', requireAuth, Profile.postLogout);

module.exports = r;
