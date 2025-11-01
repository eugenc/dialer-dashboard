import axios from 'axios';

// Use local backend in development, production URL otherwise
const getApiBaseUrl = () => {
  // Check if explicitly set via env variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development (localhost), use local backend
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  
  // Default to production
  return 'https://ai-predictive-dialer.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();
const API_KEY = import.meta.env.VITE_API_KEY || '386f11e1dc8631c73c126acc4a76c050757ab5abcb99583af201f9186dbb0d9f';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY
  }
});

// Campaign API
export const campaignApi = {
  getStats: () => apiClient.get('/monitor/stats'),
  getStatus: () => apiClient.get('/campaign/status'),
  getLeads: () => apiClient.get('/campaign/leads'),
  getLogs: (limit = 100) => apiClient.get(`/campaign/logs?limit=${limit}`),
  startCampaign: () => apiClient.post('/campaign/start'),
  stopCampaign: () => apiClient.post('/campaign/stop'),
  uploadLeads: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/campaign/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

