import express from 'express';
import {
  register,
  login,
  logout,
  activation,
  verify,
  reset,
  rememberCredentials,
  clearCredentials,
  refresh,
  compareTokens,
  getCredentials,
} from '../controllers/auth.controllers.js';
import { catchError, catchAuthorizationError } from '../middlewares/catchError.js';

export const authRouter = express.Router();

authRouter.post('/registration', catchError(register));

authRouter.get('/activate/:activationToken', catchError(activation));

authRouter.post('/login', catchError(login));

authRouter.get('/logout', catchError(logout));

authRouter.post('/verify', catchError(verify));

authRouter.post('/compare-tokens', catchError(compareTokens));

authRouter.post('/reset', catchError(reset));

authRouter.get('/get-credentials', catchError(getCredentials));

authRouter.post('/remember-credentials', catchError(rememberCredentials));

authRouter.get('/clear-credentials', catchError(clearCredentials));

authRouter.get('/refresh', catchAuthorizationError(refresh));
