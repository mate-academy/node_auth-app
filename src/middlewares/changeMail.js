import { tokenRepository } from '../entity/token.repository.js';
import { usersRepository } from '../entity/users.repository.js';
import { tokenService } from '../utils/jwt.service.js';
import { mailService } from '../utils/mailer.js';

async function sendEmailList(params, email) {
  console.log(
    `==========ACTIVATE MIDDLEFUNCTION | PARAMS: ${params} | EMAIL: ${email}================`,
  );

  if (!email) {
    console.error('Email is undefined in sendEmailList');

    return;
  }

  const link = mailService.generateAproveLink('email', params);

  await mailService.send(email, 'Confirm email changing', link);
}

export async function mailMiddleware(req, res, next) {
  const { newEmail, userEmail } = req.body;
  const { accessToken, refreshToken } = await tokenRepository.getTokens(req);

  if (req.params.userId && req.params.newEmail) {
    return next();
  }

  if (!newEmail || !userEmail) {
    res.status(400).json('Invalid data request');

    return;
  }

  const currentUser = await usersRepository.getByEmail(userEmail);

  if (!currentUser) {
    return res.status(404).json('User not found');
  }

  const dbRefresh = await tokenRepository.getRefreshToken(currentUser.id);

  const isMatchAccess = tokenService.verify(accessToken);
  const isMatchRefresh =
    dbRefresh && !!tokenService.verifyRefresh(dbRefresh.refreshToken);
  const isAliveRefresh = dbRefresh.refreshToken === refreshToken;

  if (isMatchAccess && isMatchRefresh && isAliveRefresh) {
    currentUser.onChanging = new Date();
    await currentUser.save();

    const linkParams = `${currentUser.id}/${newEmail}`;

    await sendEmailList(linkParams, newEmail);

    return res.status(200).json('List was sent to new email');
  } else if (!isMatchAccess && isMatchRefresh && isAliveRefresh) {
    const newAccess = tokenService.sign({
      name: currentUser.name,
      email: currentUser.email,
    });

    res.set('Authorization', `Bearer ${newAccess}`);
    currentUser.onChanging = new Date();
    await currentUser.save();

    const linkParams = `${currentUser.id}/${newEmail}`;

    await sendEmailList(linkParams, newEmail);

    return res.status(200).json('List was sent to new email');
  }

  return res.status(403).json('User unauthorized');
}
