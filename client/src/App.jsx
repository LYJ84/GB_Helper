import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import ApiSettings from './pages/ApiSettings';
import './App.less';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<OrderManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="settings" element={<ApiSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App; 