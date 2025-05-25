import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/auth', // Your backend URL
});

// Define TypeScript interfaces for response data
/**
 * @typedef {Object} RegisterResponse
 * @property {string} message
 * @property {string} [userId]
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {string} [userId]
 */

// Register User
/** @param {any} userData @returns {Promise<RegisterResponse>} */
export const register = async (userData) => {
  /** @type {import('axios').AxiosResponse<RegisterResponse>} */
  const response = await API.post('/register', userData);
  return response.data;
};

// Login User
/** @param {any} credentials @returns {Promise<LoginResponse>} */
export const login = async (credentials) => {
  /** @type {import('axios').AxiosResponse<LoginResponse>} */
  const response = await API.post('/login', credentials);
  return response.data;
};
