import axios from 'axios';

const SERVER_HOST = 'http://localhost:3005'

export const api = axios.create({
  baseURL: SERVER_HOST,
  withCredentials: true,
});
