import { db } from '../utils/db.js';
function create(email, password, activationToken, name) {
    return db.user.create({
        data: { email, password, activationToken, name },
    });
}
function getByEmail(email) {
    return db.user.findUnique({
        where: { email },
    });
}
function getById(id) {
    return db.user.findUnique({
        where: { id },
    });
}
function activate(email) {
    return db.user.update({
        where: { email },
        data: {
            activationToken: null,
            isActive: true,
        },
    });
}
function updateName(id, name) {
    return db.user.update({
        where: { id },
        data: { name },
    });
}
function updateEmail(id, email) {
    return db.user.update({
        where: { id },
        data: { email },
    });
}
function updatePassword(id, password) {
    return db.user.update({
        where: { id },
        data: { password },
    });
}
function setResetToken(email, resetToken, expiry) {
    return db.user.update({
        where: { email },
        data: {
            resetToken,
            resetTokenExpiry: expiry,
        },
    });
}
function resetPassword(email, password) {
    return db.user.update({
        where: { email },
        data: {
            password,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
}
function getAllActive() {
    return db.user.findMany({
        where: { isActive: true },
    });
}
export const usersRepository = {
    create,
    getByEmail,
    getById,
    activate,
    updateName,
    updateEmail,
    updatePassword,
    setResetToken,
    resetPassword,
    getAllActive,
};
