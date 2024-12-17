const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, reviewController.createReview);

router.get('/', authenticateToken, reviewController.getAllReviews);

router.get('/:id', authenticateToken, reviewController.getReviewById);

router.put('/:id', authenticateToken, reviewController.updateReview);

router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
