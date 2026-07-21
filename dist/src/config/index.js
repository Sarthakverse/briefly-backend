"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}
exports.config = {
    port: process.env.PORT || 4000,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL,
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    allowNgrokOrigins: process.env.ALLOW_NGROK_ORIGINS === 'true',
};
