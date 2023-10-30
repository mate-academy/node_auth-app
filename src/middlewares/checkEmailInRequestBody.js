'use strict';

const checkEmailInRequestBody = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send({
      error: 'Email not found in the request body',
    });

    return;
  }
  next();
};

module.exports = {
  checkEmailInRequestBody,
};
