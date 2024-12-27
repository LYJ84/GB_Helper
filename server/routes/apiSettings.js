const express = require('express');
const router = express.Router();
const { apiSettings } = require('../data/mockData');

// 获取API设置
router.get('/', (req, res) => {
  res.json(apiSettings);
});

// 更新API设置
router.put('/', (req, res) => {
  Object.assign(apiSettings, req.body);
  res.json(apiSettings);
});

module.exports = router; 