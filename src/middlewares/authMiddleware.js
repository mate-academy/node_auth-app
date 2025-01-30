import { jwtService } from '../services/jwt.service.js';
import { sessionService } from '../services/session.service.js';

export const authMiddleware = async (req, res, next) => {
  // console.log('' +
  //   'Inside authMiddleware'
  //   + ''
  // );
  const authorization = req.headers['authorization'] || '';
  const [, accessToken] = authorization.split(' ');

  // console.log(`Access token: ${accessToken}`)
  if (!authorization || !accessToken) {
    return res.status(401).send({
      message: 'No authorization header provided',
    });
  }

  const userData = await jwtService.verify(accessToken);

  if (!userData) {
    return res.status(401).send({
      message: 'Wrong token was passed',
    });
  }

  const session = await sessionService.findByUserId(userData.id);
  // console.log(`Inside authMiddleware, session obj: ${session.tokenVersion}`);
  // console.log(`Passed tokenVersion from jwt: ${userData.tokenVersion}`);

  if (userData.tokenVersion !== session.tokenVersion) {
    // console.log('Token versions didnt match, access denied');
    return res.status(401).send({
      message: 'Token versions didnt match, access denied',
    });
  }

  // console.log('Passed all checks in authMiddleware');
  next();
};
