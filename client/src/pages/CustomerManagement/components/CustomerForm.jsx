import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createCustomer, updateCustomer } from '../../../services/customerService';

const CustomerForm = ({ visible, onCancel, onSuccess, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          id: String(initialValues.id).padStart(7, '0') // 格式化显示ID
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 处理ID
      const formData = {
        ...values,
        id: values.id ? parseInt(values.id) : undefined // 如果有ID则转换为数字，否则undefined
      };
      
      if (initialValues) {
        await updateCustomer(initialValues.id, formData);
        message.success('更新成功');
      } else {
        await createCustomer(formData);
        message.success('创建成功');
      }
      
      onSuccess();
    } catch (error) {
      if (error.errorFields) {
        message.error('请检查输入');
      } else {
        message.error('操作失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? '编辑客户' : '新增客户'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="id"
          label="客户ID"
          rules={[
            { pattern: /^\d{7}$/, message: '请输入7位数字' },
            { validator: async (_, value) => {
              if (value) {
                const num = parseInt(value);
                if (num < 1000000) {
                  throw new Error('ID必须大于等于1000000');
                }
              }
            }}
          ]}
        >
          <Input placeholder="留空将自动生成" maxLength={7} />
        </Form.Item>

        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="nickname"
          label="昵称"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="地址"
          rules={[{ required: true, message: '请输入客户地址' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="备注"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerForm; 