import { Router } from 'express';
import { profileController } from '../api/profile.controller';

const profileRouter = Router();

profileRouter.patch('/name', profileController.updateName);
profileRouter.patch('/password', profileController.updatePassword);
profileRouter.patch('/email', profileController.updateEmail);

export default profileRouter;
