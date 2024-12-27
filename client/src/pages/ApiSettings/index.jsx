import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Select, Button, message } from 'antd';
import { getApiSettings, updateApiSettings } from '../../services/apiService';
import './index.less';

const { Option } = Select;

const ApiSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getApiSettings();
      form.setFieldsValue(data);
    } catch (error) {
      message.error('获取API设置失败');
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await updateApiSettings(values);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-settings">
      <Card title="API设置" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="model"
            label="AI模型"
            rules={[{ required: true, message: '请选择AI模型' }]}
          >
            <Select>
              <Option value="glm-4-flash">GLM-4-Flash</Option>
              <Option value="spark-lite">Spark-Lite</Option>
              <Option value="hunyuan-lite">HunYuan-Lite</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="apiUrl"
            label="API接口地址"
            rules={[{ required: true, message: '请输入API接口地址' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ApiSettings; 