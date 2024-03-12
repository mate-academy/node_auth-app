import axios from 'axios';

export function createClient() {
  return axios.create({
    baseURL: process.env.SERVER_URL,
    withCredentials: true,
  });
}
