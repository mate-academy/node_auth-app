"use strict";
/* eslint-disable object-curly-newline */

const { checkIsReqBodyValid } = require("../utils/checkIsReqBodyValid");

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

  if (!isEmailValid) {
    res.sendStatus(400);
    return;
  }

  next();
}

module.exports = { validateEmailAndPasswordReqParams };
