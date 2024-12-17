const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, favoriteController.addFavorite);

router.get('/', authenticateToken, favoriteController.getFavorites);

router.delete('/:part_id', authenticateToken, favoriteController.removeFavorite);

module.exports = router;
