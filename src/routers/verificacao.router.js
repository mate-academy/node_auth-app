import express from 'express';
import { verificacaoEmail } from '../controllers/verificacao.controller.js';
import { autenticado } from '../middleware/autenticado.js';

const router = express.Router();

router.get('/', autenticado, verificacaoEmail);

export default router;
