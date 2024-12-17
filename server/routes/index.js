const Router = require('express').Router;
const router = new Router();

router.use('/users', require('./userRouter'));
router.use('/reviews', require('./reviewRouter'));
router.use('/favorites', require('./favoriteRouter'));
router.use('/inventories', require('./inventoryRouter'));
router.use('/orders', require('./orderRouter'));
router.use('/parts', require('./partRouter'));
router.use('/suppliers', require('./supplierRouter'));

module.exports = router;