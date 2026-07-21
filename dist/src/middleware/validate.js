"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const AppError_1 = require("../utils/AppError");
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        throw new AppError_1.BadRequestError(result.error.issues.map(issue => issue.message).join(', '));
    }
    req.body = result.data;
    next();
};
exports.validate = validate;
