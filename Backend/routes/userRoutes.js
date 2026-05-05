const express = require('express');
const router = express.Router();
const { 
  updateUser, 
  getUserById, 
  getAllUsers, 
  createUser, 
  checkUsername, 
  deleteUser 
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Route to fetch all users
router.get('/all', authenticate, getAllUsers);

// Route to create a new user
router.post('/create', authenticate, createUser);

// Route to check if username exists
router.get('/check-username/:username', authenticate, checkUsername);

// Route to update a user by ID
router.put('/update/:id', authenticate, updateUser);

// Route to delete a user by ID
router.delete('/delete/:id', authenticate, deleteUser);

// Route to fetch a single user by ID
router.get('/fetch/:id', authenticate, getUserById);

module.exports = router;