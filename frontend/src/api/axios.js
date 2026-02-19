import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kp_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('kp_refresh_token');
        const res = await axios.post(`${BASE}/auth/refresh/`, { refresh });
        localStorage.setItem('kp_access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch {
        ['kp_access_token', 'kp_refresh_token', 'kp_user'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (d) => api.post('/auth/login/', d),
  register: (d) => api.post('/auth/register/', d),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (d) => api.put('/auth/profile/', d),
  changePassword: (d) => api.post('/auth/change-password/', d),
  listUsers: (p) => api.get('/auth/users/', { params: p }),
};

export const documentsAPI = {
  upload: (fd) => api.post('/documents/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (p) => api.get('/documents/', { params: p }),
  getById: (id) => api.get(`/documents/${id}/`),
  update: (id, d) => api.put(`/documents/${id}/`, d),
  delete: (id) => api.delete(`/documents/${id}/`),
  approve: (id, action) => api.post(`/documents/${id}/approve/`, { action }),
  newVersion: (id, f) => { const fd = new FormData(); fd.append('file', f); return api.post(`/documents/${id}/new-version/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  versionStatus: (vid) => api.get(`/documents/versions/${vid}/status/`),
};

export const queryAPI = {
  ask: (d) => api.post('/retrieval/query/', d),
  history: (p) => api.get('/retrieval/queries/', { params: p }),
  getById: (id) => api.get(`/retrieval/queries/${id}/`),
};

export const feedbackAPI = {
  submit: (d) => api.post('/retrieval/feedback/', d),
  list: (p) => api.get('/retrieval/feedback/list/', { params: p }),
  review: (id) => api.post(`/retrieval/feedback/${id}/review/`),
};

export const analyticsAPI = {
  stats: () => api.get('/analytics/stats/'),
  queries: (p) => api.get('/analytics/queries/', { params: p }),
  me: () => api.get('/analytics/me/'),
};

export const auditAPI = {
  logs: (p) => api.get('/audit/logs/', { params: p }),
};

export default api;
