const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
} = require('../controllers/userController');

const {
  updateProfileValidation,
  changePasswordValidation,
  changeEmailValidation,
} = require('../middleware/validation');

const { requireAuth } = require('../middleware/auth');

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);
router.put('/change-email', changeEmailValidation, changeEmail);

module.exports = router;
