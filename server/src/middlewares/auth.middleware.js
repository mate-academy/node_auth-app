"use strict";
/* eslint-disable object-curly-newline */

const { checkIsReqBodyValid } = require("../utils/checkIsReqBodyValid");
const authServices = require("../services/auth.services");

function checkIsEmailValid(email) {
  const emailRegex = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  return emailRegex.test(email);
}

function checkIsPasswordValid(password) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNoSpecialChars = /^[a-zA-Z0-9]+$/.test(password);

  return hasMinLength && hasUpperCase && hasNoSpecialChars;
}

function validateEmailAndPasswordReqParams(req, res, next) {
  const listOfExpectedParams = [
    { key: "email", type: "string" },
    { key: "password", type: "string" },
  ];

  const isReqBodyValid = checkIsReqBodyValid(req.body, listOfExpectedParams);

  if (!isReqBodyValid) {
    res.sendStatus(400);
    return;
  }

  const { email, password } = req.body;

  const isEmailValid = checkIsEmailValid(email);
  const isPasswordValid = checkIsPasswordValid(password);

  if (!isEmailValid || !isPasswordValid) {
    res.sendStatus(400);
    return;
  }

  next();
}

async function checkIsEmailAlreadyExistInDB(req, res, next) {
  const { email } = req.body;
  const user = await authServices.getByEmail(email);

  if (user) {
    res.sendStatus(409);
    return;
  }

  next();
}

module.exports = {
  validateEmailAndPasswordReqParams,
  checkIsEmailAlreadyExistInDB,
};
