import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5700',
  withCredentials: true, // Це критично для передачі кук
});

export default api;
