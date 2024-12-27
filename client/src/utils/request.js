import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

// 请求重试配置
const retryDelay = 1000; // 重试延迟
const maxRetries = 3; // 最大重试次数

// 请求拦截器
request.interceptors.request.use(
  config => {
    config.retryCount = 0; // 初始化重试次数
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const { config } = error;
    
    // 如果是连接错误且未超过最大重试次数
    if (error.message.includes('ERR_CONNECTION_REFUSED') && (!config.retryCount || config.retryCount < maxRetries)) {
      config.retryCount = config.retryCount || 0;
      config.retryCount += 1;

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      console.log(`Retrying request (${config.retryCount}/${maxRetries}):`, config.url);
      
      return request(config);
    }

    // 如果重试失败或其他错误
    const errorMessage = error.response?.data?.message || error.message;
    if (config.retryCount >= maxRetries) {
      message.error('服务器连接失败，请检查后端服务是否启动');
    } else {
      message.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default request; 