"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const user_service_1 = require("../services/user.service");
const mailer_1 = require("../utils/mailer");
const validators_1 = require("../utils/validators");
const getAll = async (req, res) => {
    const users = await user_service_1.userService.getAllActive();
    res.json(users.map(user_service_1.userService.normalize));
};
const getMe = async (req, res) => {
    const user = await user_service_1.userService.getById(req.user.id);
    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    }
    res.json(user_service_1.userService.normalize(user));
};
const updateProfile = async (req, res) => {
    const { name } = req.body;
    const updatedUser = await user_service_1.userService.updateName(req.user.id, name);
    res.json(user_service_1.userService.normalize(updatedUser));
};
const updatePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmation } = req.body;
    if (!oldPassword || !newPassword || !confirmation) {
        return res.status(400).json({
            message: 'All password fields are required',
        });
    }
    if (newPassword !== confirmation) {
        return res.status(400).json({
            message: 'New password and confirmation do not match',
        });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({
            message: 'Password must contain at least 6 characters',
        });
    }
    try {
        const updatedUser = await user_service_1.userService.updatePassword(req.user.id, oldPassword, newPassword);
        res.json(user_service_1.userService.normalize(updatedUser));
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    message: error.message,
                });
            }
            if (error.message === 'Old password is incorrect') {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }
        res.status(500).json({
            message: 'Something went wrong',
        });
    }
};
const requestEmailChange = async (req, res) => {
    const { password, newEmail } = req.body;
    if (!password || !newEmail) {
        return res.status(400).json({
            message: 'Password and new email are required',
        });
    }
    const normalizedEmail = newEmail.trim().toLowerCase();
    const emailError = (0, validators_1.validateEmail)(normalizedEmail);
    if (emailError) {
        return res.status(400).json({
            message: emailError,
        });
    }
    const user = await user_service_1.userService.getById(req.user.id);
    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: 'Invalid password',
        });
    }
    if (normalizedEmail === user.email) {
        return res.status(400).json({
            message: 'New email must be different',
        });
    }
    const existingUser = await user_service_1.userService.getByEmail(normalizedEmail);
    if (existingUser) {
        return res.status(409).json({
            message: 'Email is already in use',
        });
    }
    const emailChangeToken = crypto_1.default.randomBytes(32).toString('hex');
    const emailChangeTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user_service_1.userService.setPendingEmail(user.id, normalizedEmail, emailChangeToken, emailChangeTokenExpires);
    await mailer_1.mailer.sendEmailChangeConfirmation(normalizedEmail, emailChangeToken);
    res.json({
        message: 'Confirmation email has been sent',
    });
};
exports.usersController = {
    getAll,
    getMe,
    updateProfile,
    updatePassword,
    requestEmailChange,
};
