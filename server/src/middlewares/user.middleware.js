"use strict";

const jwtService = require("../services/jwt.services");
const ApiError = require("../exceptions/ApiError");

function checkIsAuthorized(req, res, next) {
  const authorization = req.headers["authorization"] || "";
  const [, token] = authorization.split(" ");

  if (!token || !authorization) {
    throw ApiError.Unauthorized();
  }
  const userData = jwtService.verifyToken(token);
  console.log("userData", userData);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  next();
}

module.exports = { checkIsAuthorized };
