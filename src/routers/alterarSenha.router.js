'use strict';

import express from 'express';
import { modificarSenha } from '../controllers/alterarSenha.controller.js';
import { autenticado } from '../middleware/autenticado.js';

const router = express.Router();

router.patch('/', autenticado, modificarSenha);

export default router;
