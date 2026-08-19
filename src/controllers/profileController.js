'use strict';

const asyncHandler = require('../utils/asyncHandler');
const toPublicUser = require('../utils/publicUser');

function createProfileController(profileService, sessionService) {
  return {
    getProfile(req, res) {
      res.json({ user: toPublicUser(req.user) });
    },

    updateName: asyncHandler(async (req, res) => {
      const user = await profileService.updateName(req.user, req.body.name);

      res.json({ user: toPublicUser(user) });
    }),

    updatePassword: asyncHandler(async (req, res) => {
      await profileService.updatePassword(req.user, req.body);
      await sessionService.createSession(req.user, res);
      res.json({ message: 'Password updated successfully' });
    }),

    updateEmail: asyncHandler(async (req, res) => {
      const user = await profileService.updateEmail(req.user, req.body);

      res.json({ user: toPublicUser(user) });
    }),
  };
}

module.exports = createProfileController;
