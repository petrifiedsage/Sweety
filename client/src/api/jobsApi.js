import api from './axios';

export async function getDailyReminder(date) {
  const response = await api.get('/jobs/reminders', { params: { date } });
  return response.data;
}

export async function triggerDailyReminder(date) {
  const response = await api.post('/jobs/reminders/trigger', { date });
  return response.data;
}
