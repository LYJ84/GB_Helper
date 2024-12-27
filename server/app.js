const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();

// 配置 CORS
app.use(cors({
  origin: 'http://localhost:3000', // 前端地址
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// 解析请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 使用路由
app.use(routes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3001;

// 优化服务器启动
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 