import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Steps } from 'antd';
import OrderConfirmForm from './OrderConfirmForm';
import { parseOrder } from '../../../services/orderService';

const { TextArea } = Input;

const OrderForm = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedOrders, setParsedOrders] = useState([]);
  const [rawOrderText, setRawOrderText] = useState('');

  const handleParse = async () => {
    if (!rawOrderText.trim()) {
      message.warning('请输入订单文本');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending order text:', rawOrderText);
      const result = await parseOrder(rawOrderText);
      console.log('Parse result:', result);
      setParsedOrders(Array.isArray(result) ? result : [result]);
      setCurrentStep(1);
    } catch (error) {
      console.error('Parse error:', error);
      message.error(error.response?.data?.message || '解析订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    setParsedOrders([]);
    setRawOrderText('');
    form.resetFields();
    onCancel();
  };

  const steps = [
    {
      title: '输入订单',
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="orderText"
            label="订单文本"
            rules={[{ required: true, message: '请输入订单文本' }]}
          >
            <TextArea
              rows={10}
              placeholder="请粘贴原始订单文本"
              value={rawOrderText}
              onChange={(e) => setRawOrderText(e.target.value)}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: '确认订单',
      content: (
        <OrderConfirmForm
          orders={parsedOrders}
          onSuccess={onSuccess}
          onBack={() => setCurrentStep(0)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="新增订单"
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={
        currentStep === 0 ? [
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="parse"
            type="primary"
            loading={loading}
            onClick={handleParse}
          >
            解析订单
          </Button>,
        ] : null
      }
    >
      <Steps current={currentStep} items={steps} />
      <div style={{ marginTop: 24 }}>
        {steps[currentStep].content}
      </div>
    </Modal>
  );
};

export default OrderForm; 