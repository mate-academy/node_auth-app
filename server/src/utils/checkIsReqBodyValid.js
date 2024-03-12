"use strict";

function checkIsReqBodyValid(params, listOfExpectedParams) {
  if (Object.keys(params).length === 0) {
    return false;
  }

  return listOfExpectedParams.every(({ key, type }) => {
    const paramValue = params[key];

    return params.hasOwnProperty(key) && isValidParam(paramValue, type);
  });
}

function isValidParam(paramValue, type) {
  if (paramValue === undefined || paramValue === null) {
    return false;
  }

  switch (type) {
    case "string":
      return typeof paramValue === "string";

    case "number":
      return typeof paramValue === "number";

    default:
      return;
  }
}

module.exports = { checkIsReqBodyValid };
