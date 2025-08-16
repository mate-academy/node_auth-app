const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authMiddleware');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile/name', authenticate, userController.updateName);
router.put('/profile/password', authenticate, userController.updatePassword);
router.put('/profile/email', authenticate, userController.updateEmail);

module.exports = router;
