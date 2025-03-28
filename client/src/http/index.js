import axios from 'axios';

const PORT = process.env.PORT || 7080;

const BASE_URL = `http://localhost:${PORT}`;

export function createClient() {
  return axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });
}
