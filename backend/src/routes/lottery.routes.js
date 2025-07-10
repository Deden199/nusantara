// src/routes/lottery.routes.js
const express = require('express');
const ctrl    = require('../controllers/lottery.controller');
const router  = express.Router();

// Public endpoints
router.get('/pools',               ctrl.listPools);
router.get('/pools/:city/latest',  ctrl.latestByCity);

// Admin login
router.post('/admin/login',        ctrl.login);

// Admin-protected endpoints
router.post(
  '/admin/pools',
  ctrl.authMiddleware,
  ctrl.addPool
);
router.put(
  '/admin/pools/:city/results',
  ctrl.authMiddleware,
  ctrl.overrideResults
);

// **Baru**: histori override
router.get(
  '/admin/overrides',
  ctrl.authMiddleware,
  ctrl.listOverrides    // pastikan ini diekspor di lottery.controller
);
router.get('/admin/stats',                   ctrl.getStats);


module.exports = router;
