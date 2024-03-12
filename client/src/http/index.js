import axios from 'axios';

export function createClient() {
  console.log('process.env.SERVER_URL', process.env.SERVER_URL);
  return axios.create({
    baseURL: 'http://localhost:5000/',
    withCredentials: true,
  });
}
