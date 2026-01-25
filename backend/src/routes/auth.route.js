import { Router } from 'express';
import { register, activate, login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.get('/activate/:token', activate);
router.post('/login', login);

export default router;
