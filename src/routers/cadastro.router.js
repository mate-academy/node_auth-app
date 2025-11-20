'use strict';
import express from 'express';
import { postCadastro } from '../controllers/cadastro.controller.js';

const router = express.Router();

router.post('/', postCadastro);

export default router;
