const express = require('express');
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(verifyToken);

router.get('/', profileController.getProfile);
router.put('/name', profileController.updateName);
router.put('/password', profileController.updatePassword);
router.put('/email', profileController.updateEmail);

module.exports = router;
