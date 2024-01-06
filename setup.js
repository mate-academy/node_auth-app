
import 'dotenv/config.js'
import {Token} from "./src/models/Token.js";
import {sequelize} from "./src/utils/db.js";

sequelize.sync();
