'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_js_1 = require("./routes/auth.router.js");
const db_js_1 = require("./config/db.js");
const user_router_js_1 = require("./routes/user.router.js");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use('/auth', auth_router_js_1.authRouter);
app.use('/users', user_router_js_1.usersRouter);
app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});
async function start() {
    try {
        await db_js_1.sequelize.authenticate();
        // eslint-disable-next-line no-console
        console.log("Виконано з'єднання з бд");
        await db_js_1.sequelize.sync();
        // eslint-disable-next-line no-console
        console.log('Створено моделі в бд');
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log('Помилка запуску сервера', error);
    }
}
start();
