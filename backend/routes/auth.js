const express = require('express');
const router = express.Router();
const { createUser, login, getAllUsers, deleteUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/login', login);
router.post('/create-user', auth, createUser); // Only admins can create users
router.get('/users', auth, getAllUsers); // Only admins can see all users
router.delete('/users/:userId', auth, deleteUser); // Only admins can delete users

module.exports = router;
