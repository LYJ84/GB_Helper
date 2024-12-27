import React, { useState, useEffect } from 'react';
import { Table, Button, Space, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd';
import { createOrder } from '../../../services/orderService';
import { useCustomers } from '../../../hooks/useCustomers';
import moment from 'moment';

const OrderConfirmForm = ({ orders, onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const { customers, loading: customersLoading } = useCustomers();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // 修改初始化数据的转换
  const [editingOrders, setEditingOrders] = useState(() => {
    console.log('Initial orders:', orders);
    return orders.flatMap(order => {
      // 尝试根据客户名称匹配客户ID
      const matchedCustomer = customers.find(c => 
        c.name === order.customerName || 
        c.nickname === order.customerName
      );

      return order.items.map(item => ({
        customerName: order.customerName,
        customerId: matchedCustomer?.id || null,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        deliveryDate: order.deliveryDate ? moment(order.deliveryDate) : moment().add(1, 'days'),
        remarks: order.remarks || ''
      }));
    });
  });

  // 当客户列表加载完成后，尝试自动匹配客户ID
  useEffect(() => {
    if (!customersLoading && customers.length > 0) {
      setEditingOrders(prevOrders => 
        prevOrders.map(order => {
          const matchedCustomer = customers.find(c => 
            c.name === order.customerName || 
            c.nickname === order.customerName
          );
          return {
            ...order,
            customerId: matchedCustomer?.id || order.customerId
          };
        })
      );
    }
  }, [customers, customersLoading]);

  // 添加行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  // 批量删除选中的订单
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的订单');
      return;
    }

    const newOrders = editingOrders.filter((_, index) => 
      !selectedRowKeys.includes(index.toString())
    );
    setEditingOrders(newOrders);
    setSelectedRowKeys([]);
    message.success(`��删除 ${selectedRowKeys.length} 条订单`);
  };

  const columns = [
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (value, record, index) => (
        <Select
          style={{ width: '100%' }}
          value={record.customerId}
          placeholder={value}
          onChange={(val) => handleFieldChange(index, 'customerId', val)}
          allowClear
        >
          {customers.map(customer => (
            <Select.Option key={customer.id} value={customer.id}>
              {customer.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value) => value.toString()
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value) => typeof value === 'number' ? value.toFixed(2) : '0.00'
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => typeof value === 'number' ? value.toFixed(2) : '0.00'
    },
    {
      title: '到货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (value, record, index) => (
        <DatePicker
          value={moment(value)}
          onChange={(val) => handleFieldChange(index, 'deliveryDate', val)}
          format="YYYY-MM-DD"
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (value) => value || '-'
    }
  ];

  const handleFieldChange = (index, field, value) => {
    const newOrders = [...editingOrders];
    newOrders[index] = {
      ...newOrders[index],
      [field]: value,
    };
    
    // 如果修改了单价，重新计算总价
    if (field === 'unitPrice') {
      const quantity = Number(newOrders[index].quantity);
      const unitPrice = Number(value);
      newOrders[index].totalPrice = quantity * unitPrice;
    }
    
    setEditingOrders(newOrders);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const ordersToSubmit = editingOrders.map(order => ({
        customerName: order.customerName,
        customerId: order.customerId,
        productName: order.productName,
        quantity: Number(order.quantity),
        unitPrice: Number(order.unitPrice),
        totalPrice: Number(order.totalPrice),
        deliveryDate: moment(order.deliveryDate).format('YYYY-MM-DD'),
        remarks: order.remarks || ''
      }));

      console.log('提交订单数据:', {
        总数: ordersToSubmit.length,
        订单列表: ordersToSubmit
      });
      
      await Promise.all(ordersToSubmit.map(order => createOrder(order)));
      message.success('订单创建成功');
      onSuccess();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('保存订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {customersLoading ? (
        <div>加载客户列表中...</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Popconfirm
                title="确定要删除选中的订单吗？"
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  danger 
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除
                </Button>
              </Popconfirm>
              <span style={{ marginLeft: 8 }}>
                {selectedRowKeys.length > 0 ? 
                  `已选择 ${selectedRowKeys.length} 项` : ''}
              </span>
            </Space>
          </div>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={editingOrders}
            rowKey={(record, index) => index.toString()}
            pagination={false}
          />
        </>
      )}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={onBack}>返回修改</Button>
          <Button 
            type="primary" 
            loading={loading} 
            onClick={handleSubmit}
            disabled={customersLoading}
          >
            确认提交
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default OrderConfirmForm; 