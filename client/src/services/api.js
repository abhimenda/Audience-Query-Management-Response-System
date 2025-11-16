import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const queriesAPI = {
  getAll: (params = {}) => api.get('/queries', { params }),
  getById: (id) => api.get(`/queries/${id}`),
  create: (data) => api.post('/queries', data),
  update: (id, data) => api.put(`/queries/${id}`, data),
  delete: (id) => api.delete(`/queries/${id}`),
  bulk: (data) => api.post('/queries/bulk', data),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getTags: () => api.get('/analytics/tags'),
  getResponseTimes: (period = 7) => api.get('/analytics/response-times', { params: { period } }),
  getTrends: (period = 30) => api.get('/analytics/trends', { params: { period } }),
  getTeams: () => api.get('/analytics/teams'),
};

export default api;


