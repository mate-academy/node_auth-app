const authContoller = require('../controllers/auth.controller');
const Router = require('express').Router;
const { catchError } = require('../utils/catchError');

const authRoute = Router();

authRoute.post('/registration', catchError(authContoller.register));
authRoute.post('/login', catchError(authContoller.login));
authRoute.post('/logout', catchError(authContoller.logout));
authRoute.post('/send-reset', catchError(authContoller.sendResetPassword));

authRoute.get('/reset/:resetToken', catchError(authContoller.resetPassword));
authRoute.get('/activate/:token', catchError(authContoller.activate));
authRoute.get('/refresh', catchError(authContoller.refresh));

module.exports = { authRoute };
