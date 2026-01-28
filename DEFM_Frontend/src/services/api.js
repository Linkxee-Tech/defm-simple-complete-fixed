// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  
});

// Health check function (uses base URL, not /api/v1)
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const user = localStorage.getItem('user');
//     if (user) {
//       try {
//         const userData = JSON.parse(user);
//         const token = localStorage.getItem('token');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      // if (error.response.status === 401) {
      //   localStorage.removeItem('user');
      //   localStorage.removeItem('token');
      //   window.location.href = '/login';
      // }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data);
      }
      
      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.error('Resource not found:', error.response.data);
      }
      
      // Handle 500 Internal Server Error
      if (error.response.status === 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication API
// Authentication API
export const authAPI = {
  login: async (username, password) => {
    // const form = new URLSearchParams();
    // form.append('username', username);
    // form.append('password', password);

    const form = {
      username: username,
      password: password
    };


    const response = await api.post('/auth/login', form);

    if(response.status == 200){
      alert("Login Successful");
    }
    const token = response.data?.access_token;
    if (token) localStorage.setItem('token', token);

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};


// Users API
export const usersAPI = {
  me: () => api.get('/users/me'),
  list: (params = {}) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Cases API
export const casesAPI = {
  dashboard: () => api.get('/cases/dashboard'),
  list: (params = {}) => api.get('/cases', { params }),
  get: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
};

// Evidence API
export const evidenceAPI = {
  list: (params = {}) => api.get('/evidence', { params }),
  get: (id) => api.get(`/evidence/${id}`),
  create: (data) => api.post('/evidence', data),
  update: (id, data) => api.put(`/evidence/${id}`, data),
  delete: (id) => api.delete(`/evidence/${id}`),
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/evidence/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  download: (id) => api.get(`/evidence/${id}/download`, {
    responseType: 'blob',
  }),
  verifyIntegrity: (id) => api.post(`/evidence/${id}/verify-integrity`),
};

// Chain of Custody API
export const chainOfCustodyAPI = {
  list: (params = {}) => api.get('/chain-of-custody', { params }),
  get: (id) => api.get(`/chain-of-custody/${id}`),
  getByEvidence: (evidenceId) => api.get(`/chain-of-custody/evidence/${evidenceId}`),
  create: (data) => api.post('/chain-of-custody', data),
  transfer: (data) => api.post('/chain-of-custody/transfer', null, { params: data }),
  delete: (id) => api.delete(`/chain-of-custody/${id}`),
};

// Reports API
export const reportsAPI = {
  list: (params = {}) => api.get('/reports', { params }),
  get: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  generate: (caseId, params = {}) => api.post(`/reports/generate/${caseId}`, null, { params }),
  download: (id) => api.get(`/reports/${id}/download`, {
    responseType: 'blob',
  }),
  delete: (id) => api.delete(`/reports/${id}`),
};

// Audit Logs API
export const auditLogsAPI = {
  list: (params = {}) => api.get('/audit-logs', { params }),
  recent: (limit = 50) => api.get('/audit-logs/recent', { params: { limit } }),
  getByUser: (userId, params = {}) => api.get(`/audit-logs/user/${userId}`, { params }),
  getByEntity: (entityType, entityId) => api.get(`/audit-logs/entity/${entityType}/${entityId}`),
};

export default api;
