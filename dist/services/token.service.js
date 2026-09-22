"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokensService = void 0;
const Token_1 = require("../models/Token");
const create = (userId, refreshToken) => {
    return Token_1.Token.create({
        userId,
        refreshToken,
    });
};
const getByToken = (refreshToken) => {
    return Token_1.Token.findOne({
        where: {
            refreshToken,
        },
    });
};
const deleteByUserId = (userId) => {
    return Token_1.Token.destroy({
        where: {
            userId,
        },
    });
};
exports.tokensService = {
    create,
    getByToken,
    deleteByUserId,
};
