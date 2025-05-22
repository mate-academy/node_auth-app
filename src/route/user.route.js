// import { express } from 'express';
import { Router } from 'express';
import { userController } from '../controllers/user.controllers.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';
import { catchError } from '../utils/catchError.js';

// export const authRouter = new express.Router();
export const userRouter = Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.get('/:userId', authMiddleware, catchError(userController.getOne));
userRouter.patch('/:userId', authMiddleware, catchError(userController.update));
