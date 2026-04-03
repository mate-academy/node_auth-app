/* eslint-disable */
const jwtService = require('../services/jwt.service.js')

const authMiddleware = (req, res, next) => {
    const authorisation = req.headers['authorization'] || '';
    const [, token] = authorisation.split(' ');

    if (!authorisation || !token) {
        res.sendStatus(401);

        return;
    }

    const userData = jwtService.verify(token);

    if (!userData) {
        res.sendStatus(401);

        return;
    }
req.user = userData; 
    next();
}

module.exports = {
    authMiddleware
}