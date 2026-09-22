"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
function normalize({ id, name, email }) {
    return { id, name, email };
}
const getByEmail = (email) => {
    return User_1.User.findOne({ where: { email } });
};
const getById = (id) => {
    return User_1.User.findByPk(id);
};
const create = (name, email, password, activationToken) => {
    return User_1.User.create({
        name,
        email,
        password,
        activationToken,
    });
};
const activate = async (email) => {
    const user = await getByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    user.activationToken = null;
    user.isActive = true;
    await user.save();
    return user;
};
const getAllActive = () => {
    return User_1.User.findAll({
        where: { activationToken: null },
    });
};
const updateResetToken = async (email, resetToken) => {
    await User_1.User.update({ resetToken }, { where: { email } });
};
const getByResetToken = (resetToken) => {
    return User_1.User.findOne({
        where: { resetToken },
    });
};
const createNewPassword = async (email, passwordHash) => {
    await User_1.User.update({
        password: passwordHash,
        resetToken: null,
    }, { where: { email } });
};
const updateName = async (id, name) => {
    const user = await User_1.User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    user.name = name;
    await user.save();
    return user;
};
const updatePassword = async (id, oldPassword, newPassword) => {
    const user = await User_1.User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt_1.default.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new Error('Old password is incorrect');
    }
    const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();
    return user;
};
const setPendingEmail = async (id, pendingEmail, emailChangeToken, emailChangeTokenExpires) => {
    const user = await User_1.User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    user.pendingEmail = pendingEmail;
    user.emailChangeToken = emailChangeToken;
    user.emailChangeTokenExpires = emailChangeTokenExpires;
    await user.save();
    return user;
};
const getByEmailChangeToken = async (emailChangeToken) => {
    return User_1.User.findOne({
        where: { emailChangeToken },
    });
};
const confirmEmailChange = async (user) => {
    if (!user.pendingEmail) {
        throw new Error('Pending email not found');
    }
    const oldEmail = user.email;
    const newEmail = user.pendingEmail;
    user.email = newEmail;
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpires = null;
    await user.save();
    return {
        oldEmail,
        newEmail,
        user,
    };
};
exports.userService = {
    normalize,
    getByEmail,
    getById,
    create,
    activate,
    getAllActive,
    updateResetToken,
    getByResetToken,
    createNewPassword,
    updateName,
    updatePassword,
    setPendingEmail,
    getByEmailChangeToken,
    confirmEmailChange,
};
