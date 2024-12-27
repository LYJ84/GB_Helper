const Customer = require('./Customer');
const Order = require('./Order');

// 建立模型关联
Customer.hasMany(Order, {
  foreignKey: 'customerId'
});

Order.belongsTo(Customer, {
  foreignKey: 'customerId'
});

module.exports = {
  Customer,
  Order
}; 