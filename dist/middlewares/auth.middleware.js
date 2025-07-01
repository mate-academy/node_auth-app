import { jwt } from '../utils/jwt.js';
import { usersRepository } from '../entity/users.repository.js';
export function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const [, accessToken] = authHeader.split(' ');
    if (!authHeader || !accessToken) {
        return res.status(401).json({ message: 'Token is required' });
    }
    const userData = jwt.validateAccessToken(accessToken);
    if (!userData) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    // Add user data to request for use in controllers
    req.user = userData;
    next();
}
export async function authMiddlewareWithUser(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const [, accessToken] = authHeader.split(' ');
    if (!authHeader || !accessToken) {
        return res.status(401).json({ message: 'Token is required' });
    }
    const userData = jwt.validateAccessToken(accessToken);
    if (!userData) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    // Verify user still exists in database
    const user = await usersRepository.getById(userData.id);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    // Add user data to request for use in controllers
    req.user = userData;
    req.userEntity = user;
    next();
}
