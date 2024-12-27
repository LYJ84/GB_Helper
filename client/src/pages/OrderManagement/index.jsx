import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm } from 'antd';
import { getOrders, batchDeleteOrders } from '../../services/orderService';
import OrderForm from './components/OrderForm';
import moment from 'moment';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      // 确保 orders 是数组
      const orderData = response.data || [];
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
      setOrders([]); // 出错时设置为空数组
    } finally {
      setLoading(false);
    }
  };

  // 批量删除订单
  const handleBatchDelete = async () => {
    try {
      setLoading(true);
      await batchDeleteOrders(selectedRowKeys);
      message.success('删除成功');
      setSelectedRowKeys([]);
      fetchOrders();
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
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
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value) => value.toFixed(2)
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => value.toFixed(2)
    },
    {
      title: '到货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (value) => moment(value).format('YYYY-MM-DD')
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (value) => value || '-'
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" onClick={() => setModalVisible(true)}>
            新增订单
          </Button>
          <Popconfirm
            title="确定要删除选中的订单吗？"
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
            disabled={selectedRowKeys.length === 0}
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
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <OrderForm
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchOrders();
        }}
      />
    </div>
  );
};

export default OrderManagement; 