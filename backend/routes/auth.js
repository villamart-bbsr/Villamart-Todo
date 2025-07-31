const express = require('express');
const router = express.Router();
const { createUser, login, getAllUsers, deleteUser, updateProfile, getProfile } = require('../controllers/authController');
const { auth, admin } = require('../middleware/auth');

router.post('/login', login);
router.post('/create-user', auth, admin, createUser); // Only admins can create users
router.get('/users', auth, getAllUsers); // Only admins can see all users
router.delete('/users/:userId', auth, deleteUser); // Only admins can delete users
router.get('/profile', auth, getProfile); // Get user profile
router.put('/profile', auth, updateProfile); // Update user profile

module.exports = router;
