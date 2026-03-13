import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const authAPI = {
  login: (d) => api.post('/api/auth/login', d),
  register: (d) => api.post('/api/auth/register', d),
  me: () => api.get('/api/auth/me'),
  updateMe: (d) => api.put('/api/auth/me', d),
};

export const propertiesAPI = {
  list: (params) => api.get('/api/properties/', { params }),
  featured: () => api.get('/api/properties/featured'),
  get: (id) => api.get(`/api/properties/${id}`),
  my: () => api.get('/api/properties/my'),
  create: (d) => api.post('/api/properties/', d),
  update: (id, d) => api.put(`/api/properties/${id}`, d),
  delete: (id) => api.delete(`/api/properties/${id}`),
  toggleFav: (id) => api.post(`/api/properties/${id}/favorite`),
  favorites: () => api.get('/api/properties/favorites/list'),
};

export const bookingsAPI = {
  create: (d) => api.post('/api/bookings/', d),
  my: () => api.get('/api/bookings/my'),
  hostBookings: () => api.get('/api/bookings/host'),
  get: (id) => api.get(`/api/bookings/${id}`),
  update: (id, d) => api.put(`/api/bookings/${id}`, d),
  preview: (params) => api.get('/api/bookings/preview', { params }),
  availability: (params) => api.get(`/api/bookings/availability/${params.property_id}`, { params }),
  stats: () => api.get('/api/bookings/stats/dashboard'),
};

export const reviewsAPI = {
  list: (propId) => api.get(`/api/reviews/property/${propId}`),
  create: (d) => api.post('/api/reviews/', d),
  respond: (id, d) => api.put(`/api/reviews/${id}`, d),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};

export const usersAPI = {
  list: () => api.get('/api/users/'),
  get: (id) => api.get(`/api/users/${id}`),
  update: (id, d) => api.put(`/api/users/${id}`, d),
};

export default api;
