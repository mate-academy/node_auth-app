"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateName = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (value) => {
    const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
    if (!value) {
        return 'Email is required';
    }
    if (!EMAIL_PATTERN.test(value)) {
        return 'Email is not valid';
    }
};
exports.validateEmail = validateEmail;
const validatePassword = (value) => {
    if (!value) {
        return 'Password is required';
    }
    if (value.length < 6) {
        return 'At least 6 characters';
    }
};
exports.validatePassword = validatePassword;
const validateName = (value) => {
    if (!value.trim()) {
        return 'Name is required';
    }
};
exports.validateName = validateName;
