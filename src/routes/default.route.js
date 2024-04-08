const { Router } = require('express');

const defaultRoute = Router();

defaultRoute.use((req, res) => {
  res.sendStatus(404);
});

module.exports = {
  defaultRoute,
};
