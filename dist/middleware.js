"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const config_1 = require("./config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt = jsonwebtoken_1.default;
function userMiddleware(req, res, next) {
    const token = req.headers["token"];
    const datas = jwt.verify(token, config_1.JWT_SECRET);
    if (datas) {
        //@ts-ignore 
        req.id = datas.id;
        next();
    }
    else {
        res.json({
            message: "unauthorized"
        });
    }
}
