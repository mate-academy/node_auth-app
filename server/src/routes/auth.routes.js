const express = require('express');
const authControler = require('../controlers/auth.controler');
const authMiddleware = require('../middlewares/auth.middleware');

const authRouter = new express.Router();

authRouter.get('/', authControler.getAll);
authRouter.post(
  '/registration',
  authMiddleware.validateEmailAndPasswordReqParams,
  authControler.register,
);
authRouter.post('/activation', (req, res) => res.send('activation'));
authRouter.post(
  '/login',
  authMiddleware.validateEmailAndPasswordReqParams,
  authControler.login,
);
authRouter.post('/logout', (req, res) => res.send('logout'));

module.exports = authRouter;
