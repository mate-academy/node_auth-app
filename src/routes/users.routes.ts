import { Router } from "express";
import * as userController from '../controllers/users.controller.ts';
import { catchAsync } from "../utils/catchAsync.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

export const router = Router();

router.get('/profile', authMiddleware, catchAsync(userController.profile));
router.get('/activate/:email/:activationToken', catchAsync(userController.activate));
router.post('/logout', catchAsync(userController.logout))

router.post('/login', catchAsync(userController.login));
router.post('/sign-up', catchAsync(userController.create));

router.patch('/profile/changeName', authMiddleware, catchAsync(userController.changeName))
router.patch('/profile/change',authMiddleware ,catchAsync(userController.changeSensetive))

router.post('/changePassword/generate', catchAsync(userController.generatePasswordToken));
router.patch('/changePassword', catchAsync(userController.changePassword))
