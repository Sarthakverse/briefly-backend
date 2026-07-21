"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancementController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const enhancement_service_1 = require("../services/enhancement.service");
exports.enhancementController = {
    getByRelease: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const releaseId = Array.isArray(req.params.releaseId) ? req.params.releaseId[0] : req.params.releaseId;
        const enhancements = await enhancement_service_1.enhancementService.getByRelease(releaseId);
        res.json(enhancements);
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const releaseId = Array.isArray(req.params.releaseId) ? req.params.releaseId[0] : req.params.releaseId;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Enhancement name is required' });
            return;
        }
        const enhancement = await enhancement_service_1.enhancementService.create(releaseId, name);
        res.status(201).json(enhancement);
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Enhancement name is required' });
            return;
        }
        const enhancement = await enhancement_service_1.enhancementService.update(id, name);
        res.json(enhancement);
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await enhancement_service_1.enhancementService.delete(id);
        res.json({ message: 'Enhancement deleted' });
    }),
    getRecent: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const enhancements = await enhancement_service_1.enhancementService.getRecent(limit);
        res.json(enhancements);
    }),
};
