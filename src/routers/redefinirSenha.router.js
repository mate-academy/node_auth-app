'use strict';

import express from 'express';
import { redefinirSenhaRouter } from '../controllers/redefinirSenha.controller.js';
import { autenticado } from '../middleware/autenticado.js';

const router = express.Router();

router.patch('/', autenticado, redefinirSenhaRouter);

export default router;
