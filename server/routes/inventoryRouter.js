const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, inventoryController.createInventory);

router.get('/', authenticateToken, inventoryController.getAllInventory);

router.get('/:id', authenticateToken, inventoryController.getInventoryById);

router.put('/:id', authenticateToken, inventoryController.updateInventory);

router.delete('/:id', authenticateToken, inventoryController.deleteInventory);

module.exports = router;
