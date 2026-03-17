import axios from 'axios';

// แก้ไข: เลือกใช้ API_BASE_URL เพียงบรรทัดเดียว (ผมตั้งค่า Fallback เป็นเว็บจริงให้นะครับ)
// ถ้าอยากให้รันในเครื่องเป็นหลัก สามารถเปลี่ยนเป็น 'http://localhost:3000' ได้เลย
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wd12.pupasoft.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    // เพิ่มการเช็คว่ามี config.headers อยู่จริง เพื่อให้ TypeScript สบายใจและปลอดภัยขึ้น
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // เพิ่ม Error Handler พื้นฐานเผื่อ Request พังก่อนส่ง
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string, full_name?: string) =>
    apiClient.post('/auth/register', { email, password, full_name }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  getProfile: () => apiClient.get('/auth/profile'),
};

export default apiClient;