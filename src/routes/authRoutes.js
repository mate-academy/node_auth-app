const express = require('express');
const {
  registration,
  activation,
  login,
  refresh,
  logout,
  me,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/registration', registration);
router.get('/activation/:email/:token', activation);

router.post('/login', login);
router.get('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', authMiddleware, me);

module.exports = router;
