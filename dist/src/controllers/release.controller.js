"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const release_service_1 = require("../services/release.service");
exports.releaseController = {
    getByAdapter: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const adapterId = Array.isArray(req.params.adapterId) ? req.params.adapterId[0] : req.params.adapterId;
        const releases = await release_service_1.releaseService.getByAdapter(adapterId);
        res.json(releases);
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const release = await release_service_1.releaseService.getById(id);
        res.json(release);
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const adapterId = Array.isArray(req.params.adapterId) ? req.params.adapterId[0] : req.params.adapterId;
        const { name, summary } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Release name is required' });
            return;
        }
        const release = await release_service_1.releaseService.create(adapterId, name, summary);
        res.status(201).json(release);
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { name, summary } = req.body;
        const release = await release_service_1.releaseService.update(id, { name, summary });
        res.json(release);
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await release_service_1.releaseService.delete(id);
        res.json({ message: 'Release deleted' });
    }),
    getRecent: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const releases = await release_service_1.releaseService.getRecent(limit);
        res.json(releases);
    }),
};
