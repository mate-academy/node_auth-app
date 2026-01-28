import { Router } from 'express';

import authRoutes from './auth.routes.js';
import meRoutes from './me.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/me', meRoutes);

export default router;
