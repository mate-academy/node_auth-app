"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const user_service_1 = require("../services/user.service");
const validators_1 = require("../utils/validators");
const mailer_1 = require("../utils/mailer");
const jwt_1 = require("../utils/jwt");
const token_service_1 = require("../services/token.service");
const sendAuthentication = async (res, user) => {
    const userData = user_service_1.userService.normalize(user);
    const accessToken = jwt_1.jwt.generateAccessToken(userData);
    const refreshToken = jwt_1.jwt.generateRefreshToken(userData);
    await token_service_1.tokensService.deleteByUserId(user.id);
    await token_service_1.tokensService.create(user.id, refreshToken);
    res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    res.send({
        user: userData,
        accessToken,
    });
};
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const errors = {
        name: (0, validators_1.validateName)(name),
        email: (0, validators_1.validateEmail)(email),
        password: (0, validators_1.validatePassword)(password),
    };
    if (Object.values(errors).some((error) => error)) {
        return res.status(400).json({
            errors,
            message: 'Validation error',
        });
    }
    const activationToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await user_service_1.userService.create(name, email, hashedPassword, activationToken);
    await mailer_1.mailer.sendActivationLink(email, activationToken);
    res.json({ user: user_service_1.userService.normalize(user) });
};
const activate = async (req, res) => {
    const email = req.params.email;
    const token = req.params.token;
    const user = await user_service_1.userService.getByEmail(email);
    if (!user || user.activationToken !== token) {
        return res.sendStatus(404);
    }
    await user_service_1.userService.activate(email);
    await sendAuthentication(res, user);
};
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await user_service_1.userService.getByEmail(email);
    const isPasswordValid = await bcrypt_1.default.compare(password, user?.password || '');
    if (!user || !isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
        return res.status(403).json({
            message: 'Please activate your email before logging in.',
        });
    }
    await sendAuthentication(res, user);
};
const refresh = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || '';
    const userData = jwt_1.jwt.validateRefreshToken(refreshToken);
    const user = await user_service_1.userService.getByEmail(userData?.email || '');
    const token = await token_service_1.tokensService.getByToken(refreshToken);
    if (!user || !userData || !token || token.userId !== user.id) {
        res.clearCookie('refreshToken');
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
    await sendAuthentication(res, user);
};
const logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || '';
    const userData = jwt_1.jwt.validateRefreshToken(refreshToken);
    if (userData) {
        await token_service_1.tokensService.deleteByUserId(userData.id);
    }
    res.clearCookie('refreshToken');
    res.sendStatus(204);
};
const forgotPassword = async (req, res) => {
    const email = req.body.email;
    const user = await user_service_1.userService.getByEmail(email);
    if (!user) {
        return res.json({ message: 'If this email exists, we sent a reset link.' });
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    await mailer_1.mailer.sendResetPasswordLink(email, resetToken);
    await user_service_1.userService.updateResetToken(email, resetToken);
    res.json({ message: 'If this email exists, we sent a reset link.' });
};
const resetPassword = async (req, res) => {
    const token = req.params.token;
    const password = req.body.password;
    const user = await user_service_1.userService.getByResetToken(token);
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await user_service_1.userService.createNewPassword(user.email, hashedPassword);
    res.json({ message: 'Password has been successfully reset.' });
};
const confirmEmailChange = async (req, res) => {
    const token = req.params.token;
    const user = await user_service_1.userService.getByEmailChangeToken(token);
    if (!user) {
        return res.status(400).json({
            message: 'Invalid or expired email change token',
        });
    }
    if (!user.emailChangeTokenExpires ||
        user.emailChangeTokenExpires.getTime() < Date.now()) {
        return res.status(400).json({
            message: 'Invalid or expired email change token',
        });
    }
    const { oldEmail, newEmail } = await user_service_1.userService.confirmEmailChange(user);
    await mailer_1.mailer.notifyEmailChanged(oldEmail, newEmail);
    res.redirect(`${process.env.CLIENT_URL}/email-confirmed`);
};
exports.authController = {
    register,
    activate,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    confirmEmailChange,
};
