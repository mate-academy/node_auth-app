import axios from 'axios';

export function createClient() {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005',
    withCredentials: true,
  });
}
