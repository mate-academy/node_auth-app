'use strict';
import express from 'express';
import { getLogin } from '../controllers/login.controller.js';

const router = express.Router();

router.post('/', getLogin);

export default router;
