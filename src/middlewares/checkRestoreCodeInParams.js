'use strict';

const checkRestoreCodeInParams = (req, res, next) => {
  const { restoreCode } = req.params;

  if (!restoreCode) {
    res.status(400).send({ error:
      'Password restore token not found in request parameters' });

    return;
  }
  next();
};

module.exports = {
  checkRestoreCodeInParams,
};
