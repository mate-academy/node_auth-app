"use strict";
/* eslint-disable object-curly-newline */

const { checkIsReqBodyValid } = require("../utils/checkIsReqBodyValid");
const ApiError = require("../exceptions/ApiError");

function validateEmail(value) {
  if (!value) {
    return "Email is required";
  }

  const emailRegex = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  if (!emailRegex.test(value)) {
    return "Email is not valid";
  }
}

function validatePassword(value) {
  if (!value) {
    return "Password is required";
  }

  if (value.length < 6) {
    return "At least 6 characters";
  }
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasNoSpecialChars = /^[a-zA-Z0-9]+$/.test(password);
}

function validateEmailAndPasswordReqParams(req, res, next) {
  const listOfExpectedParams = [
    { key: "email", type: "string" },
    { key: "password", type: "string" },
  ];

  const isReqBodyValid = checkIsReqBodyValid(req.body, listOfExpectedParams);

  if (!isReqBodyValid) {
    throw ApiError.BadRequest("Validation error");
  }

  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest("Validation error", errors);
  }

  next();
}

function validateEmailReqParams(req, res, next) {
  const listOfExpectedParams = [{ key: "email", type: "string" }];

  const isReqBodyValid = checkIsReqBodyValid(req.body, listOfExpectedParams);

  if (!isReqBodyValid) {
    throw ApiError.BadRequest("Validation error");
  }

  const { email } = req.body;

  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.BadRequest("Validation error", errors);
  }

  next();
}

function validatePasswordReqParams(req, res, next) {
  const listOfExpectedParams = [{ key: "password", type: "string" }];

  const isReqBodyValid = checkIsReqBodyValid(req.body, listOfExpectedParams);

  if (!isReqBodyValid) {
    throw ApiError.BadRequest("Validation error");
  }

  const { password } = req.body;

  const errors = {
    password: validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.BadRequest("Validation error", errors);
  }

  next();
}

module.exports = {
  validateEmailAndPasswordReqParams,
  validatePasswordReqParams,
  validateEmailReqParams,
};
