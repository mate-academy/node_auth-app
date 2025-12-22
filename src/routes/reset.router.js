import { Router } from 'express';
import { resetController } from '../controllers/reset.controller.js';

export const resetRouter = Router();

resetRouter.post('/', resetController.reset);
resetRouter.get('/:token/:tokenId', resetController.resetCheck);
resetRouter.post('/reset-confirm', resetController.resetConfirm);
