const express = require('express');
const profileController = require('../controllers/profileController');
const isAuthenticated = require('../middleware/isAuthenticated');

const router = express.Router();

router.get('/', isAuthenticated, profileController.getProfile);
router.post('/update-name', isAuthenticated, profileController.updateName);
router.post('/update-email', isAuthenticated, profileController.updateEmail);

router.post(
  '/update-password',
  isAuthenticated,
  profileController.updatePassword,
);

module.exports = router;
