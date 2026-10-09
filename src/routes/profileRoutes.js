const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// --- Protected Routes (Authenticated only) ---
// Note: The 'isAuthenticated' middleware is applied in index.js
// when we mount these routes, so we don't need it here.

// Get Profile (You can add this to profileController later)
// router.get('/', profileController.getProfile);

// Update Profile (Name, Password, Email)
// We use PUT because it's updating existing data
router.put('/', profileController.updateProfile);

module.exports = router;
