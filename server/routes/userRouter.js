const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken'); 

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/profile', authenticateToken, userController.getCurrentUser);

router.put('/profile', authenticateToken, userController.updateUser);

router.delete('/profile', authenticateToken, userController.deleteUser);

router.get('/', authenticateToken, userController.getAllUsers);

router.get('/:id', authenticateToken, userController.getUserById);

module.exports = router;