import express from 'express';
import { userController } from '../controller/user.controller.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.patch('/name', userController.updateName);
router.patch('/email', userController.updateEmail);
router.patch('/password', userController.updatePassword);

export default router;
