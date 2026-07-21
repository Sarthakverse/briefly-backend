"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
