const express = require('express');
const ctrl = require('../controllers/lottery.controller');

const router = express.Router();

router.get('/pools', ctrl.listPools);
router.get('/pools/:city/latest', ctrl.latestByCity);
router.post('/admin/login', ctrl.login);
router.post('/admin/pools', ctrl.authMiddleware, ctrl.addPool);
router.put('/admin/pools/:city/results', ctrl.authMiddleware, ctrl.overrideResults);

module.exports = router;
