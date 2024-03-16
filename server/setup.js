const client = require("./src/utils/db");
const User = require("./src/models/user");
const Token = require("./src/models/token");

client
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

User.sync();
Token.sync();

client.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});
