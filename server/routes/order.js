const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 获取订单列表
router.get('/', orderController.list);

// 创建新订单
router.post('/', orderController.create);

// 解析订单
router.post('/parse', orderController.parseOrder);

// 查询订单
router.get('/search', orderController.search);

// 获取单个订单
router.get('/:id', orderController.getById);

// 更新订单
router.put('/:id', orderController.update);

// 导出订单
router.get('/export', orderController.exportOrders);

// 批量删除订单
router.post('/batch-delete', orderController.batchDelete);

module.exports = router; 