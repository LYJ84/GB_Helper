let customers = [
  {
    id: 1000001,
    name: '五九八七',
    nickname: null,
    address: '北京市朝阳区xxx街道',
    remarks: ''
  },
  {
    id: 1000002,
    name: '4B1007',
    nickname: null,
    address: '北京市海淀区xxx路',
    remarks: ''
  }
];

let orders = [
  {
    id: 1,
    customerId: 1,
    productName: '苹果',
    quantity: 10,
    unitPrice: 5.5,
    totalPrice: 55,
    deliveryDate: '2024-03-20',
    remarks: '要新鲜的'
  },
  {
    id: 2,
    customerId: 2,
    productName: '香蕉',
    quantity: 5,
    unitPrice: 3.5,
    totalPrice: 17.5,
    deliveryDate: '2024-03-21',
    remarks: ''
  }
];

let apiSettings = {
  model: 'glm-4-flash',
  apiKey: 'test-api-key',
  apiUrl: 'https://api.example.com'
};

module.exports = {
  customers,
  orders,
  apiSettings
}; 