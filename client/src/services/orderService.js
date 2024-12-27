import request from '../utils/request';
import * as XLSX from 'xlsx';

export async function getOrders(params) {
  return request('/api/orders', {
    method: 'GET',
    params,
  });
}

export async function searchOrders(params) {
  return request('/api/orders/search', {
    method: 'GET',
    params,
  });
}

export async function createOrder(data) {
  return request('/api/orders', {
    method: 'POST',
    data,
  });
}

export async function updateOrder(id, data) {
  return request(`/api/orders/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function parseOrder(orderText) {
  return request('/api/orders/parse', {
    method: 'POST',
    data: { orderText },
  });
}

export function exportToExcel(orders, fileName = '订单数据.xlsx') {
  const data = orders.map(order => ({
    '订单ID': order.id,
    '客户名称': order.Customer?.name || '',
    '商品名称': order.productName,
    '数量': order.quantity,
    '单价': order.unitPrice,
    '总价': order.totalPrice,
    '到货日期': order.deliveryDate,
    '备注': order.remarks || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '订单列表');
  XLSX.writeFile(wb, fileName);
}

export async function getExportData(params) {
  return request('/api/orders/export', {
    method: 'GET',
    params,
  });
}

// 批量删除订单
export const batchDeleteOrders = async (orderIds) => {
  const response = await request.post('/api/orders/batch-delete', { orderIds });
  return response.data;
}; 