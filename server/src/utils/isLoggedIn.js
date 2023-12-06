'use strict'

export const isLoggedIn = (req, res, next) => {
  console.log({
    user_in_req: req.user
  });
  req.user ? next() : res.sendStatus(401);
};
