import Router from 'express';
import controllers from '../controllers/index.controller.js';
import middlewares from '../middleware/index.middleware.js';
import models from '../models/index.model.js';
import userSchema from '../validations/user.validation.js';

const userRouter = Router();

userRouter
  .route('/')
  .post(
    middlewares.validationField(userSchema.create),
    middlewares.isUniqueField(models.user),
    controllers.user.create,
  )
  .get(middlewares.auth, controllers.user.list);

userRouter
  .route('/:id')
  .get(middlewares.auth, middlewares.access.owner, controllers.user.find)
  .patch(
    middlewares.auth,
    middlewares.validationField(userSchema.updateInfo),
    middlewares.access.owner,
    controllers.user.updateInfo,
  )
  .delete(middlewares.auth, middlewares.access.owner, controllers.user.remove);

userRouter
  .route('/:id/password')
  .patch(
    middlewares.auth,
    middlewares.validationField(userSchema.updatePassword),
    middlewares.access.owner,
    controllers.user.updatePassword,
  );

export default userRouter;
