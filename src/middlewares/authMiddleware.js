import { jwtService } from "../services/jwt.service.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || '';
    const accessToken = authHeader.split(' ')[1];

    if (!authHeader || !accessToken) {
        return res.status(401).send('Unauthorized');
    }

    const user = jwtService.verify(accessToken);

    if (!user) {
        return res.status(401).send('Unauthorized');
    }

    req.user = user;

    next();
}
