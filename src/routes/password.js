const express = require('express');
const passwordController = require('../controllers/passwordController');
const isNotAuthenticated = require('../middleware/isNotAuthenticated');

const router = express.Router();

// Усі маршрути тут захищені — тільки для гостей
router.get('/reset', isNotAuthenticated, passwordController.getRequestPage);
router.post('/reset', isNotAuthenticated, passwordController.sendResetLink);

// Додай цей рядок під існуючими маршрутами
router.get(
  '/reset/:token',
  isNotAuthenticated,
  passwordController.getResetPage,
);

router.post(
  '/reset/:token',
  isNotAuthenticated,
  passwordController.updatePassword,
);

module.exports = router;
