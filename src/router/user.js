import express from 'express';
import { userController } from '../controller/index.js';

const userRouter = express.Router();

userRouter.put('/:userId', userController.update);

export default userRouter;
