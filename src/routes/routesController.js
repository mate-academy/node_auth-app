const express = require('express');
const cors = require('cors');
const { authUser } = require('../controller/authcontroller.js');
const { authMiddleware } = require('../middlewares/authmiddleware.js');
const {
  myProfile,
  editMyProfileName,
  editMyProfilePassword,
  editMyProfileEmail,
} = require('../controller/myprofile.js');
const {
  registerUser,
  activatedRegister,
} = require('../controller/registeruser.js');
const {
  forgotPassword,
  resetPassword,
} = require('../controller/accessrecovery.js');

function routesController() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('API funcionando');
  });

  app.post('/register', registerUser);
  app.get('/activate', activatedRegister);

  // rota de auth
  app.post('/login', authUser);

  // rota com acessos autorizados
  app.get('/me', authMiddleware, myProfile);
  app.put('/profile/name', authMiddleware, editMyProfileName);
  app.put('/profile/password', authMiddleware, editMyProfilePassword);
  app.put('/profile/email', authMiddleware, editMyProfileEmail);

  // rotas de recuperacao
  app.post('/forgot-password', forgotPassword);
  app.post('/reset-password', resetPassword);

  return app;
}

module.exports = { routesController };
