import request from '../utils/request';
import * as XLSX from 'xlsx';

export async function getCustomers(params) {
  return request('/api/customers', {
    method: 'GET',
    params,
  });
}

export async function createCustomer(data) {
  return request('/api/customers', {
    method: 'POST',
    data,
  });
}

export async function updateCustomer(id, data) {
  return request(`/api/customers/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCustomer(id) {
  return request(`/api/customers/${id}`, {
    method: 'DELETE',
  });
}

export async function importCustomers(formData) {
  return request('/api/customers/import', {
    method: 'POST',
    headers: {
      // 移除 Content-Type，让浏览器自动设置正确的 boundary
      // 'Content-Type': 'multipart/form-data',
    },
    data: formData,
  });
}

export async function exportCustomers() {
  const response = await request('/api/customers/export', {
    method: 'GET',
    responseType: 'blob',
  });

  // 创建下载链接
  const url = window.URL.createObjectURL(new Blob([response]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'customers.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
} 