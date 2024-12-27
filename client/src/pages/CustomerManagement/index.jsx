import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Modal, message, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import CustomerForm from './components/CustomerForm';
import { getCustomers, deleteCustomer, exportCustomers, importCustomers } from '../../services/customerService';
import './index.less';
import * as XLSX from 'xlsx';

const { Search } = Input;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const columns = [
    {
      title: '客户ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => String(id).padStart(7, '0'),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('获取客户列表失败:', error);
      if (!error.message.includes('ERR_CONNECTION_REFUSED')) {
        message.error('获取客户列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setSelectedCustomer(record);
    setShowForm(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除客户 "${record.name}" 吗？`,
      open: true,
      onOk: async () => {
        try {
          await deleteCustomer(record.id);
          message.success('删除成功');
          fetchCustomers();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSearch = (value) => {
    // 实现搜索逻辑
  };

  const handleImport = async (info) => {
    const { file } = info;
    
    try {
      console.log('开始导入文件:', file);
      
      // 检查文件对象
      if (!file || (!file.originFileObj && !file instanceof File)) {
        throw new Error('无效的文件对象');
      }
      
      const formData = new FormData();
      const fileObj = file.originFileObj || file;
      console.log('文件信息:', {
        name: fileObj.name,
        type: fileObj.type,
        size: fileObj.size
      });
      
      formData.append('file', fileObj);
      
      const response = await importCustomers(formData);
      console.log('导入响应:', response);
      
      message.success(response.message || '导入成功');
      fetchCustomers();
    } catch (error) {
      console.error('导入失败:', error);
      console.log('错误详情:', {
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // 显示详细错误信息
      if (error.response?.data) {
        const { error: errorMsg, details, invalidRows } = error.response.data;
        let errorText = errorMsg || '导入失败';
        
        if (details) {
          errorText += `\n${details}`;
        }
        
        if (invalidRows) {
          errorText += `\n无效数据：${JSON.stringify(invalidRows, null, 2)}`;
        }
        
        message.error(errorText);
      } else if (error.message) {
        message.error(`导入失败: ${error.message}`);
      } else {
        message.error('导入失败，请检查文件格式是否正确');
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportCustomers();
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const downloadTemplate = () => {
    const data = [
      {
        '客户ID': '1000001',
        '名称': '示例客户',
        '昵称': '示例昵称',
        '地址': '示例地址',
        '备注': '示例备注'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '客户导入模板');
    XLSX.writeFile(wb, '客户导入模板.xlsx');
  };

  return (
    <div className="customer-management">
      <div className="customer-management-header">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
            新增客户
          </Button>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            customRequest={handleImport}
            beforeUpload={(file) => {
              const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                            file.type === 'application/vnd.ms-excel';
              if (!isExcel) {
                message.error('只支持 Excel 文件格式！');
                return false;
              }
              return true;
            }}
          >
            <Button icon={<UploadOutlined />}>导入客户</Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出客户
          </Button>
          <Button onClick={downloadTemplate}>
            下载导入模板
          </Button>
        </Space>
        <Search
          placeholder="搜索客户"
          onSearch={handleSearch}
          style={{ width: 200 }}
        />
      </div>
      <div className="customer-management-content">
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </div>
      {showForm && (
        <CustomerForm
          open={showForm}
          customer={selectedCustomer}
          onCancel={() => {
            setShowForm(false);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedCustomer(null);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagement; 