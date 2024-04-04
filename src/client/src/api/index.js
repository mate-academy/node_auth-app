import axios from 'axios';

export function createClient() {
  return axios.create({
    baseURL: 'http://localhost:3005',
    withCredentials: true,
  });
};
