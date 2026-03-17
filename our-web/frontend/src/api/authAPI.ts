import axios from 'axios';

<<<<<<< HEAD
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
=======
const API_BASE_URL = 'http://10.32.198.3:3000';
>>>>>>> 49e7064d85adda96b68be14a1e075e1963e489fc

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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
