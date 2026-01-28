import { Router } from 'express';

import { meController } from '../controllers/me.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { meValidators } from '../validators/me.validators.js';

const router = Router();

router.get('/email/confirm', meController.confirmEmailChange);

router.use(authMiddleware);

router.get('/', meController.getProfile);

router.patch(
  '/name',
  validate(meValidators.updateName),
  meController.updateName,
);

router.patch(
  '/password',
  validate(meValidators.updatePassword),
  meController.updatePassword,
);

router.post(
  '/email/change-request',
  validate(meValidators.changeEmailRequest),
  meController.changeEmailRequest,
);

export default router;
