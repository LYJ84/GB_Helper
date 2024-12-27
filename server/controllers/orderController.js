const { orders } = require('../data/mockData');
const customerController = require('./customerController');
const orderParser = require('../utils/orderParser');

const orderController = {
  // 创建新订单
  async create(req, res) {
    try {
      const { 
        customerName, 
        customerId, 
        productName, 
        quantity, 
        unitPrice, 
        totalPrice, 
        deliveryDate,
        remarks
      } = req.body;

      // 如果没有 customerId，则创建或查找客户
      let finalCustomerId = customerId;
      if (!customerId && customerName) {
        const customer = await customerController.findOrCreate(customerName);
        finalCustomerId = customer.id;
      }
      
      const orderData = {
        id: orders.length + 1,
        customerId: finalCustomerId,
        customerName,
        productName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalPrice: Number(totalPrice),
        deliveryDate,
        remarks: remarks || ''
      };

      orders.push(orderData);
      res.status(201).json(orderData);
    } catch (error) {
      console.error('创建订单失败:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // 获取订单列表
  async list(req, res) {
    try {
      // 确保返回数组
      const orderList = Array.isArray(orders) ? orders : [];
      res.json({
        success: true,
        data: orderList
      });
    } catch (error) {
      console.error('获取订单列表失败:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        data: []
      });
    }
  },

  // 解析订单信息
  async parseOrder(req, res) {
    try {
      const { orderText } = req.body;
      
      if (!orderText) {
        return res.status(400).json({ error: '订单文本不能为空' });
      }

      console.log('Received order text:', orderText);
      
      const parsedOrders = orderParser.parseOrderText(orderText);
      console.log('Parsed orders:', parsedOrders);
      
      res.json(parsedOrders);
    } catch (error) {
      console.error('Order parsing error:', error);
      res.status(400).json({ 
        error: '订单解析失败',
        message: error.message 
      });
    }
  },

  // 查询订单
  async search(req, res) {
    try {
      const { customerId, startDate, endDate } = req.query;
      let filteredOrders = [...orders];

      if (customerId) {
        filteredOrders = filteredOrders.filter(order => order.customerId === parseInt(customerId));
      }

      if (startDate && endDate) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.deliveryDate);
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
      }

      const ordersWithCustomer = filteredOrders.map(order => ({
        ...order,
        Customer: customers.find(c => c.id === order.customerId)
      }));

      res.json(ordersWithCustomer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 获取单个订单详情
  async getById(req, res) {
    try {
      const order = orders.find(o => o.id === parseInt(req.params.id));
      
      if (!order) {
        return res.status(404).json({ error: '订单不存在' });
      }
      
      const orderWithCustomer = {
        ...order,
        Customer: customers.find(c => c.id === order.customerId)
      };
      
      res.json(orderWithCustomer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 更新订单
  async update(req, res) {
    try {
      const index = orders.findIndex(o => o.id === parseInt(req.params.id));
      
      if (index === -1) {
        return res.status(404).json({ error: '订单不存在' });
      }
      
      orders[index] = {
        ...orders[index],
        ...req.body
      };
      
      res.json(orders[index]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // 导出订单数据
  async exportOrders(req, res) {
    try {
      const ordersWithCustomer = orders.map(order => ({
        ...order,
        customerName: customers.find(c => c.id === order.customerId)?.name,
        customerAddress: customers.find(c => c.id === order.customerId)?.address
      }));

      res.json(ordersWithCustomer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 批量删除订单
  async batchDelete(req, res) {
    try {
      const { orderIds } = req.body;
      
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ error: '请选择要删除的订单' });
      }

      // 删除指定ID的订单
      const orderIdsSet = new Set(orderIds.map(id => Number(id)));
      const newOrders = orders.filter(order => !orderIdsSet.has(order.id));
      
      // 更新订单列表
      orders.length = 0;
      orders.push(...newOrders);

      res.json({ message: `成功删除 ${orderIds.length} 条订单` });
    } catch (error) {
      console.error('批量删除订单失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController; 