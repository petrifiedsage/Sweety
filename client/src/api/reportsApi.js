import api from './axios';

export async function fetchDailyReport(date) {
  const response = await api.get('/reports/daily', { params: { date } });
  return response.data;
}

export async function fetchMonthToDateReport(date) {
  const response = await api.get('/reports/month-to-date', { params: { date } });
  return response.data;
}

export async function fetchMonthlyReport(date) {
  const response = await api.get('/reports/monthly', { params: { date } });
  return response.data;
}
