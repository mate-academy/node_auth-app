import axios from 'axios'

export const authClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
  withCredentials: true,
});

authClient.interceptors.response.use(
  res => res.data,
)
