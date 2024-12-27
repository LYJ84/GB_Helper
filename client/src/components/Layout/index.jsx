import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import './index.less';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: '客户管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'API设置',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
  };

  const getSelectedKeys = () => {
    const path = location.pathname.split('/')[1] || 'orders';
    return [path];
  };

  return (
    <Layout className="app-layout">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        className="app-sider"
      >
        <div className="logo">团长助手</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div className="header-content">
            团长助手管理系统
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 