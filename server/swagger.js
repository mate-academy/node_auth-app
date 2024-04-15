const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Users Rest API",
  },
  host: "localhost:5000",
  //   responses: {
  //     200: {
  //       description: "Success",
  //       content: {
  //         "application/json": {
  //           schema: {
  //             // описание схемы успешного ответа, если необходимо
  //           },
  //         },
  //       },
  //     },
  //     default: {
  //       description: "Default response",
  //       content: {
  //         "application/json": {
  //           schema: {
  //             // описание схемы ответа по умолчанию, если необходимо
  //           },
  //         },
  //       },
  //     },
  //   },
};

const outputFile = "./swagger_output.json";
const routes = ["./src/index.js"];

swaggerAutogen(outputFile, routes, doc);
