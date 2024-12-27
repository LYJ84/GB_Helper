import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { parseOrder } from '../../../services/orderService';

const OrderParser = ({ visible, onCancel, onSuccess }) => {
  const [orderText, setOrderText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!orderText.trim()) {
      message.warning('请输入订单文本');
      return;
    }

    try {
      setLoading(true);
      const parsedOrder = await parseOrder(orderText);
      onSuccess(parsedOrder);
    } catch (error) {
      message.error('解析订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="解析订单"
      visible={visible}
      onCancel={onCancel}
      onOk={handleParse}
      confirmLoading={loading}
      width={600}
    >
      <Input.TextArea
        rows={10}
        value={orderText}
        onChange={(e) => setOrderText(e.target.value)}
        placeholder="请输入需要解析的订单文本"
      />
    </Modal>
  );
};

export default OrderParser; 