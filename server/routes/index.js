const express = require('express');
const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 其他路由
router.use('/api/customers', require('./customer'));
router.use('/api/orders', require('./order'));
router.use('/api/settings', require('./apiSettings'));

module.exports = router; 