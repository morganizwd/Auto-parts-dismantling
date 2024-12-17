const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const authenticateToken = require('../middleware/authenticateToken'); 

router.post('/', authenticateToken, partController.createPart);

router.get('/', partController.getAllParts);

router.get('/:id', partController.getPartById);

router.put('/:id', authenticateToken, partController.updatePart);

router.delete('/:id', authenticateToken, partController.deletePart);

module.exports = router;
