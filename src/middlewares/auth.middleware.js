import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    // console.log(req.headers.authorization);
    const auth = req.headers.authorization;
    if (!auth) {
        res.sendStatus(401);
        return;
    }

    const [,token] = auth.split(' ');

    if (!token) {
        res.status(401);
        return;
    }

    console.log(token)
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        console.log(data);
        next();
    } catch (e) {
        console.log(e);
        res.status(401);
        return;
    }
}
