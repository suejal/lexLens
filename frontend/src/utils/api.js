import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Contract API
export const contractAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('contract', file);

    return api.post('/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  getStatus: (id) => api.get(`/contracts/${id}/status`),
  delete: (id) => api.delete(`/contracts/${id}`),
};

// Clause API
export const clauseAPI = {
  getAll: (contractId) => api.get(`/clauses/${contractId}`),
  getSummary: (contractId) => api.get(`/clauses/${contractId}/summary`),
  getRisky: (contractId) => api.get(`/clauses/${contractId}/risky`),
  getByType: (contractId, type) => api.get(`/clauses/${contractId}/type/${type}`),
  getById: (clauseId) => api.get(`/clauses/clause/${clauseId}`),
};

// Analysis API
export const analysisAPI = {
  analyze: (contractId) => api.post(`/analysis/${contractId}/analyze`),
  getClauses: (contractId) => api.get(`/analysis/${contractId}/clauses`),
  getSummary: (contractId) => api.get(`/analysis/${contractId}/summary`),
};

// Comparison API
export const comparisonAPI = {
  compare: (v1Id, v2Id) => api.get(`/comparison/compare?v1=${v1Id}&v2=${v2Id}`),
};

export default api;

