import axios from 'axios';
import { setupInterceptors } from './interceptors';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

setupInterceptors(axiosClient);

export default axiosClient;