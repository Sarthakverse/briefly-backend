"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
const jwt_1 = require("../lib/jwt");
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError_1.UnauthorizedError('No token provided'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
        if (!user)
            return next(new AppError_1.UnauthorizedError('User not found'));
        req.user = user;
        next();
    }
    catch (err) {
        return next(new AppError_1.UnauthorizedError('Invalid token'));
    }
}
function requireAdmin(req, res, next) {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return next(new AppError_1.ForbiddenError('Admin access required'));
    }
    next();
}
