'use strict';

import express from 'express';
import {
  getPerfil,
  patchPerfilEmail,
  patchPerfilNome,
} from '../controllers/perfil.controller.js';
import { autenticado } from '../middleware/autenticado.js';

const router = express.Router();

router.get('/', autenticado, getPerfil);
router.patch('/', patchPerfilNome);
router.patch('/', patchPerfilEmail);

export default router;
