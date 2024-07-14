import { userController } from '../controlles/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { userRouter } from './user.route.js';

userRouter.get('/', authMiddleware, userController.allUserActivated);
