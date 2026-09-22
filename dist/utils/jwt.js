"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign(user, SECRET, { expiresIn: '10m' });
};
const validateAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET);
    }
    catch (error) {
        return null;
    }
};
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
};
const validateRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.jwt = {
    generateAccessToken,
    validateAccessToken,
    generateRefreshToken,
    validateRefreshToken,
};
