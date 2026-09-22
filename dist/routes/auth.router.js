"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/registration', auth_controller_1.authController.register);
exports.authRouter.get('/activation/:email/:token', auth_controller_1.authController.activate);
exports.authRouter.post('/login', auth_controller_1.authController.login);
exports.authRouter.get('/refresh', (0, cookie_parser_1.default)(), auth_controller_1.authController.refresh);
exports.authRouter.post('/logout', (0, cookie_parser_1.default)(), auth_controller_1.authController.logout);
exports.authRouter.post('/forgot-password', auth_controller_1.authController.forgotPassword);
exports.authRouter.post('/reset-password/:token', auth_controller_1.authController.resetPassword);
exports.authRouter.get('/email-confirmation/:token', auth_controller_1.authController.confirmEmailChange);
