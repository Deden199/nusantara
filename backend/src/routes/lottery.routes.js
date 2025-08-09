// src/routes/lottery.routes.js
const express = require('express');
const ctrl    = require('../controllers/lottery.controller');
const router  = express.Router();

// Public endpoints
router.get('/pools',               ctrl.listPools);
router.get('/pools/latest',        ctrl.latestMany);
router.get('/pools/:city/latest',  ctrl.latestByCity);
router.get('/history', ctrl.listAllHistory);
router.post('/:city/live-draw', ctrl.startLiveDraw);

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
// Schedule management
router.get('/admin/schedules', ctrl.authMiddleware, ctrl.listSchedules);
router.post('/admin/schedules', ctrl.authMiddleware, ctrl.createSchedule);
router.put('/admin/schedules/:city', ctrl.authMiddleware, ctrl.updateSchedule);
router.delete('/admin/schedules/:city', ctrl.authMiddleware, ctrl.deleteSchedule);
router.delete('/admin/pools/:city', ctrl.authMiddleware, ctrl.deletePool);
router.get('/schedules', ctrl.publicSchedules);

module.exports = router;
