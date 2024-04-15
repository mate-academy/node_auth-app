"use strict";

const jwtService = require("../services/jwt.services");
const ApiError = require("../exceptions/ApiError");

function checkIsAuthorized(req, res, next) {
  const authorization = req.headers["authorization"] || "";
  const [, token] = authorization.split(" ");

  if (!token || !authorization) {
    // #swagger.responses[401] = { description: 'Unauthorized'}
    throw ApiError.Unauthorized();
  }
  const userData = jwtService.verifyToken(token);

  if (!userData) {
    // #swagger.responses[401] = { description: 'Unauthorized'}
    throw ApiError.Unauthorized();
  }

  next();
}

module.exports = { checkIsAuthorized };
