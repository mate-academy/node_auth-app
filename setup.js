import "dotenv/config";
import { sequelize } from "./src/utils/db.js";
import { User } from "./src/models/User.js";
import { Token } from "./src/models/Token.js";

sequelize.sync({ force: true });
