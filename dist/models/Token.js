"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const User_js_1 = require("./User.js");
let Token = class Token extends sequelize_typescript_1.Model {
};
exports.Token = Token;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_js_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", Number)
], Token.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_js_1.User),
    __metadata("design:type", User_js_1.User)
], Token.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Token.prototype, "refreshToken", void 0);
exports.Token = Token = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'Token',
        timestamps: false,
    })
], Token);
