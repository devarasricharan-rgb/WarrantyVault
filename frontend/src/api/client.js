import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const productApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (formData) => {
    // If FormData is passed, allow browser to set boundary header
    const headers = formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return apiClient.post('/products', formData, { headers });
  },
  update: (id, formData) => {
    const headers = formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return apiClient.put(`/products/${id}`, formData, { headers });
  },
  delete: (id) => apiClient.delete(`/products/${id}`),
  getReceiptUrl: (id) => `${API_BASE_URL}/products/${id}/receipt`,
};

export const warrantyApi = {
  getActive: (params) => apiClient.get('/warranties/active', { params }),
  getExpiringSoon: (params) => apiClient.get('/warranties/expiring-soon', { params }),
  getExpired: (params) => apiClient.get('/warranties/expired', { params }),
};

export const repairApi = {
  getAll: (params) => apiClient.get('/repairs', { params }),
  getById: (id) => apiClient.get(`/repairs/${id}`),
  getByProduct: (productId) => apiClient.get(`/repairs/product/${productId}`),
  create: (data) => apiClient.post('/repairs', data),
  update: (id, data) => apiClient.put(`/repairs/${id}`, data),
  updateStatus: (id, data) => apiClient.patch(`/repairs/${id}/status`, data),
  delete: (id) => apiClient.delete(`/repairs/${id}`),
};

export const notificationApi = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  getRecent: () => apiClient.get('/notifications/recent'),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getCategories: () => apiClient.get('/dashboard/categories'),
};

export default apiClient;
