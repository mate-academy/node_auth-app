import { Router } from 'express';
import * as tokenController from '../controllers/tokens.controller.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const router = Router();

router.post('/generate', catchAsync(tokenController.refreshAccessToken));

router.get('/checkAccess', catchAsync(tokenController.checkAccess));
