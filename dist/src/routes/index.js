"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const adapter_routes_1 = __importDefault(require("./adapter.routes"));
const release_routes_1 = __importDefault(require("./release.routes"));
const enhancement_routes_1 = __importDefault(require("./enhancement.routes"));
const meeting_routes_1 = __importDefault(require("./meeting.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/adapters', adapter_routes_1.default);
router.use('/releases', release_routes_1.default);
router.use('/enhancements', enhancement_routes_1.default);
router.use('/meetings', meeting_routes_1.default);
exports.default = router;
