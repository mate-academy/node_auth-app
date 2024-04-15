const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Auth/Users Rest API",
  },
  host: "localhost:5000",
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int32",
          },
          email: {
            type: "string",
            format: "email",
          },
        },
      },
      UserWithAccessToken: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/User",
          },
          accessToken: {
            type: "string",
          },
        },
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const routes = ["./src/index.js"];

swaggerAutogen(outputFile, routes, doc);
