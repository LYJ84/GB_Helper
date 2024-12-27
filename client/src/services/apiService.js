import request from '../utils/request';

export async function getApiSettings() {
  return request('/api/settings', {
    method: 'GET',
  });
}

export async function updateApiSettings(data) {
  return request('/api/settings', {
    method: 'PUT',
    data,
  });
} 