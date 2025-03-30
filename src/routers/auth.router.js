import Router from 'express';
import controllers from '../controllers/index.controller.js';
import middlewares from '../middleware/index.middleware.js';

const authRouter = Router();

authRouter
  .get(
    '/activate/:token',
    middlewares.access.token('activate', 'params'),
    controllers.auth.activate,
  )
  .post('/login', middlewares.access.user, controllers.auth.login)
  .post('/logout', controllers.auth.logout)
  .get('/refresh', middlewares.access.user, controllers.auth.refresh);

export default authRouter;
