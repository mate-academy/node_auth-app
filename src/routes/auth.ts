import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/test', (_, res) => {
  res.send('Auth route is working');
})

export default router;
