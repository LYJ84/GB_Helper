const { customers } = require('../data/mockData');

const customerController = {
  // ... 其他方法保持不变

  // 根据名称查找或创建客户
  async findOrCreate(customerName) {
    try {
      // 先查找是否存在
      let customer = customers.find(c => 
        c.name === customerName || 
        c.nickname === customerName
      );

      // 如果不存在，创建新客户
      if (!customer) {
        customer = {
          id: customers.length + 1,
          name: customerName,
          nickname: null,
          address: '',
          remarks: ''
        };
        customers.push(customer);
      }

      return customer;
    } catch (error) {
      console.error('查找或创建客户失败:', error);
      throw error;
    }
  }
};

module.exports = customerController; 