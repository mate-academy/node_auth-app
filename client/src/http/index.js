import axios from 'axios';

export function createClient() {
  return axios.create({
    baseURL: import.meta.env.APP_API_URL,
    withCredentials: true,
  });
}
