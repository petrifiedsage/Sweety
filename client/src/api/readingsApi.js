import api from './axios';

export async function getReadings(params = {}) {
  const response = await api.get('/readings', { params });
  return response.data;
}

export async function getReadingById(id) {
  const response = await api.get(`/readings/${id}`);
  return response.data;
}

export async function createReading(payload) {
  const response = await api.post('/readings', payload);
  return response.data;
}

export async function updateReading(id, payload) {
  const response = await api.put(`/readings/${id}`, payload);
  return response.data;
}

export async function deleteReading(id) {
  const response = await api.delete(`/readings/${id}`);
  return response.data;
}
