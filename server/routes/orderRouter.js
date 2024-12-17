const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken'); 

router.post('/', authenticateToken, orderController.createOrder);

router.get('/', authenticateToken, orderController.getOrders);

router.get('/:id', authenticateToken, orderController.getOrderById);

router.put('/:id/status', authenticateToken, orderController.updateOrderStatus);

router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
