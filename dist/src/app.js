"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin(origin, callback) {
        // Requests without an Origin header include curl, server-to-server calls, and mobile clients.
        if (!origin)
            return callback(null, true);
        const isConfiguredOrigin = config_1.config.corsOrigins.includes(origin);
        const isNgrokOrigin = config_1.config.allowNgrokOrigins
            && /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin);
        return callback(null, isConfiguredOrigin || isNgrokOrigin);
    },
}));
app.use(express_1.default.json({ limit: '5mb' }));
app.use('/api', routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
