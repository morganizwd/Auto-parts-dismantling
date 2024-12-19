// routes/partRouter.js

const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/uploadPartImage');

router.post('/', authenticateToken, partController.createPart);

router.get('/', partController.getAllParts);

router.get('/:id', partController.getPartById);

router.put('/:id', authenticateToken, partController.updatePart);

router.delete('/:id', authenticateToken, partController.deletePart);

router.post('/:id/image', authenticateToken, upload.single('image'), partController.uploadPartImage);

module.exports = router;
