"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.hashToken = hashToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
function generateAccessToken(userId, email) {
    return jsonwebtoken_1.default.sign({ userId, email }, config_1.config.jwtSecret, { expiresIn: '15m' });
}
function generateRefreshToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
}
// Hash function for refresh tokens (SHA-256)
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
