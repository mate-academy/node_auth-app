import {
  badRequest,
  forbidden,
  notFound,
  unauthorized,
} from './request.error.js';
import zod from './zod.error.js';

const errors = {
  badRequest: (message) => badRequest(message),
  notFound: (message) => notFound(message),
  unauthorized: (message) => unauthorized(message),
  forbidden: (message) => forbidden(message),
  zod: (err, res) => zod(err, res),
};

export default errors;
