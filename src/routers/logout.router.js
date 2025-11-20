'use strict';
import express from 'express';
import { getLogout } from '../controllers/logout.controller.js';

const router = express.Router();

router.post('/', getLogout);

export default router;
