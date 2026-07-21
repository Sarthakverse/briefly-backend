"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const adapter_service_1 = require("../services/adapter.service");
exports.adapterController = {
    getAll: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const adapters = await adapter_service_1.adapterService.getAll();
        res.json(adapters);
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Adapter name is required' });
            return;
        }
        const adapter = await adapter_service_1.adapterService.create(name);
        res.status(201).json(adapter);
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const name = Array.isArray(req.body.name) ? req.body.name[0] : req.body.name;
        if (!name) {
            res.status(400).json({ message: 'Adapter name is required' });
            return;
        }
        const adapter = await adapter_service_1.adapterService.update(id, name);
        res.json(adapter);
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await adapter_service_1.adapterService.delete(id);
        res.json({ message: 'Adapter deleted' });
    }),
    getRecent: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const adapters = await adapter_service_1.adapterService.getRecent(limit);
        res.json(adapters);
    }),
};
