import { Router } from 'express';
import { body } from 'express-validator';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validationMiddleware from '../middleware/validation.middleware.js';

const router = new Router();

// --- РЕГИСТРАЦИЯ И ЛОГИН ---
router.post(
  '/registration',
  body('email').isEmail().withMessage('Некорректный email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Пароль должен быть не менее 8 символов')
    .matches(/\d/)
    .withMessage('Пароль должен содержать хотя бы одну цифру')
    .matches(/[A-Z]/)
    .withMessage('Пароль должен содержать заглавную букву'),
  body('name').notEmpty().withMessage('Имя не может быть пустым'),
  validationMiddleware,
  userController.registration,
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Введите пароль'),
  validationMiddleware,
  userController.login,
);

router.post('/logout', authMiddleware, userController.logout);
router.get('/activate/:token', userController.activate);

// --- СБРОС ПАРОЛЯ (FORGOT/RESET) ---
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Некорректный email'),
  validationMiddleware,
  userController.forgotPassword,
);

router.post(
  '/reset-password/:token',
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Пароль должен быть не менее 8 символов'),
  body('confirmation').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Пароли не совпадают');
    }

    return true;
  }),
  validationMiddleware,
  userController.resetPassword,
);

// --- ПРОФИЛЬ И ОБНОВЛЕНИЕ ДАННЫХ ---
router.get('/profile', authMiddleware, userController.getProfile);

router.put(
  '/update-name',
  authMiddleware,
  body('name').notEmpty().withMessage('Имя не может быть пустым'),
  validationMiddleware,
  userController.updateName,
);

router.put(
  '/update-password',
  authMiddleware,
  body('oldPassword').notEmpty().withMessage('Введите старый пароль'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Новый пароль от 8 символов'),
  body('confirmation').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Подтверждение пароля не совпадает');
    }

    return true;
  }),
  validationMiddleware,
  userController.updatePassword,
);

router.put(
  '/update-email',
  authMiddleware,
  body('newEmail').isEmail().withMessage('Введите корректный новый email'),
  body('confirmEmail').custom((value, { req }) => {
    if (value !== req.body.newEmail) {
      throw new Error('Email адреса не совпадают');
    }

    return true;
  }),
  body('password').notEmpty().withMessage('Для подтверждения нужен пароль'),
  validationMiddleware,
  userController.updateEmail,
);

export default router;
