"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || '';
    const [, accessToken] = authHeader.split(' ');
    if (!authHeader || !accessToken) {
        res.status(401).json({ message: 'Token is required' });
        return;
    }
    const userData = jwt_1.jwt.validateAccessToken(accessToken);
    if (!userData) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
    req.user = userData;
    next();
};
exports.authMiddleware = authMiddleware;
