"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("radhe radhe");
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const mongoose_1 = __importDefault(require("mongoose"));
const jwt = jsonwebtoken_1.default;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, firstName, lastName } = req.body;
    try {
        const response = yield db_1.userModel.create({
            username,
            password,
            firstName,
            lastName
        });
        const user = response._id;
        yield db_1.accountModel.create({
            user,
            balance: 1 + Math.random() * 10000
        });
        res.json({
            message: "you are signed up !!"
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "coudn't signed up "
        });
    }
}));
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const response = yield db_1.userModel.findOne({
            username,
            password
        });
        if (response) {
            const token = jwt.sign({ id: response._id }, config_1.JWT_SECRET);
            res.json({
                token: token
            });
        }
    }
    catch (_a) {
        res.json({
            message: "invalid credentials !!"
        });
    }
}));
app.put('/api/v1/update', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, firstName, lastName } = req.body;
    try { //@ts-ignore 
        //@ts-ignore
        yield db_1.userModel.updateOne({ _id: req.id }, {
            password,
            firstName,
            lastName
        });
        res.json({
            message: "updated succesfully"
        });
    }
    catch (_a) {
        res.json({
            message: "updated unsuccesfully"
        });
    }
}));
app.get('/api/v1/getUser', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.query.filter || "";
    const user = yield db_1.userModel.find({
        $or: [{
                firstName: {
                    "$regex": filter
                },
                lastName: {
                    "$regex": filter
                }
            }]
    });
    res.json({
        users: user.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.firstName,
            id: user._id
        }))
    });
}));
app.get('/api/v1/getBalance', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield db_1.accountModel.findOne({
        user: req.id
    });
    res.json({
        balance: response === null || response === void 0 ? void 0 : response.balance
    });
}));
app.post('/api/v1/transfer', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    const { amount, to } = req.body;
    const myAccount = yield db_1.accountModel.findOne({
        //@ts-ignore
        user: req.id
    }).session(session); //@ts-ignore
    if ((myAccount === null || myAccount === void 0 ? void 0 : myAccount.balance) < amount) {
        yield session.abortTransaction();
        res.json({
            message: "insufficient balance !!"
        });
    }
    else {
        const toAccount = yield db_1.accountModel.findOne({
            user: to
        }).session(session);
        //@ts-ignore
        yield db_1.accountModel.updateOne({ user: req.id }, { $inc: { balance: -amount } }).session(session);
        yield db_1.accountModel.updateOne({ user: to }, { $inc: { balance: amount } }).session(session);
        yield session.commitTransaction();
        res.json({
            message: "tranfer succesful !!!"
        });
    }
}));
app.listen(3001, () => {
    console.log("server is listening on port 3001");
});
