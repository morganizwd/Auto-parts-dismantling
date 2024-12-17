const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, supplierController.createSupplier);

router.get('/', supplierController.getAllSuppliers);

router.get('/:id', supplierController.getSupplierById);

router.put('/:id', authenticateToken, supplierController.updateSupplier);

router.delete('/:id', authenticateToken, supplierController.deleteSupplier);

module.exports = router;
