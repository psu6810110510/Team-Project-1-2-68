import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, full_name?: string) =>
    apiClient.post('/auth/register', { email, password, full_name }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  getProfile: () => apiClient.get('/auth/profile'),
};

export default apiClient;
